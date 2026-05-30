/** `dspec setup` — multi-step provider → key → model wizard. */

import { Box, Text, render, useApp, useInput } from "ink";
import { TextInput } from "ink";
import React, { useState } from "react";
import {
  type DeepSeekSpecConfig,
  type ProviderId,
  SUPPORTED_OFFICIAL_MODELS,
  defaultConfigPath,
  isPlausibleKey,
  loadApiKey,
  loadGlmApiKey,
  loadMimoApiKey,
  readConfig,
  redactKey,
  writeConfig,
} from "../../config.js";
import { loadDotenv } from "../../env.js";
import { t } from "../../i18n/index.js";
import { type SelectItem, SingleSelect } from "../ui/Select.js";
import {
  type ApiKeyValidationResult,
  validateDeepSeekApiKey,
  validateGlmApiKey,
  validateMimoApiKey,
} from "../validate-api-key.js";

export interface SetupOptions {
  forceKeyStep?: boolean;
}

type Step = "provider" | "key" | "model" | "saved";

const DEEPSEEK_MODELS = SUPPORTED_OFFICIAL_MODELS.filter((m) => m.startsWith("deepseek-"));
const GLM_MODELS = SUPPORTED_OFFICIAL_MODELS.filter((m) => m.startsWith("glm-"));
const MIMO_MODELS = SUPPORTED_OFFICIAL_MODELS.filter((m) => m.startsWith("mimo-"));

export async function setupCommand(_opts: SetupOptions = {}): Promise<void> {
  loadDotenv();
  const existingDsKey = loadApiKey();
  const existingGlmKey = loadGlmApiKey();
  const existingMimoKey = loadMimoApiKey();
  const cfg = readConfig();
  const activeProvider = cfg.provider ?? "deepseek";
  const existingModel = cfg.model;

  const { waitUntilExit, unmount } = render(
    <SetupWizard
      initialProvider={activeProvider}
      existingDsKey={existingDsKey}
      existingGlmKey={existingGlmKey}
      existingMimoKey={existingMimoKey}
      existingModel={existingModel}
      onComplete={() => undefined}
      onCancel={() => unmount()}
    />,
    { exitOnCtrlC: true, patchConsole: false },
  );
  await waitUntilExit();
}

function SetupWizard({
  initialProvider,
  existingDsKey,
  existingGlmKey,
  existingMimoKey,
  existingModel,
  onComplete,
  onCancel,
}: {
  initialProvider: ProviderId;
  existingDsKey?: string;
  existingGlmKey?: string;
  existingMimoKey?: string;
  existingModel?: string;
  onComplete: () => void;
  onCancel: () => void;
}) {
  const { exit } = useApp();
  const [step, setStep] = useState<Step>("provider");
  const [provider, setProvider] = useState<ProviderId>(initialProvider);

  const handleProvider = (p: ProviderId) => {
    setProvider(p);
    setStep("key");
  };

  const handleKeySaved = (_key: string) => {
    const models =
      provider === "deepseek" ? DEEPSEEK_MODELS : provider === "glm" ? GLM_MODELS : MIMO_MODELS;
    if (models.length > 0) {
      setStep("model");
    } else {
      finish();
    }
  };

  const handleModel = (m: string) => {
    finish(m);
  };

  const finish = (overrideModel?: string) => {
    const cfg: DeepSeekSpecConfig = {
      ...readConfig(),
      provider,
      setupCompleted: true,
    };
    if (overrideModel) cfg.model = overrideModel;
    writeConfig(cfg);
    setStep("saved");
    onComplete();
  };

  useInput((_input, key) => {
    if (key.escape && step !== "saved") onCancel();
  });

  if (step === "saved") {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor="ansi:green" paddingX={1}>
        <Text bold color="ansi:green">
          {t("setup.savedTitle")}
        </Text>
        <Box marginTop={1}>
          <Text dim>{t("setup.savedFooter")}</Text>
        </Box>
        <ExitOnEnter onExit={exit} />
      </Box>
    );
  }

  if (step === "provider") {
    return <ProviderStep initial={provider} onSubmit={handleProvider} onCancel={onCancel} />;
  }

  if (step === "key") {
    return (
      <KeyStep
        provider={provider}
        existingKey={
          provider === "deepseek"
            ? existingDsKey
            : provider === "glm"
              ? existingGlmKey
              : existingMimoKey
        }
        onSaved={handleKeySaved}
      />
    );
  }

  if (step === "model") {
    const models =
      provider === "deepseek" ? DEEPSEEK_MODELS : provider === "glm" ? GLM_MODELS : MIMO_MODELS;
    return <ModelStep models={models} initial={existingModel} onSubmit={handleModel} />;
  }

  return null;
}

function ProviderStep({
  initial,
  onSubmit,
  onCancel,
}: {
  initial: ProviderId;
  onSubmit: (p: ProviderId) => void;
  onCancel: () => void;
}) {
  const items: SelectItem<ProviderId>[] = [
    { value: "deepseek", label: t("setup.providerDeepSeek"), hint: "platform.deepseek.com" },
    { value: "glm", label: t("setup.providerGlm"), hint: "open.bigmodel.cn" },
    { value: "mimo", label: t("setup.providerMimo"), hint: "platform.xiaomimimo.com" },
  ];
  return (
    <Box flexDirection="column" borderStyle="round" borderColor="ansi:cyan" paddingX={1}>
      <Text bold color="ansi:cyan">
        {t("setup.title")}
      </Text>
      <Box marginTop={1}>
        <Text>{t("setup.providerPrompt")}</Text>
      </Box>
      <Box marginTop={1}>
        <SingleSelect
          items={items}
          initialValue={initial}
          onSubmit={onSubmit}
          onCancel={onCancel}
          footer={t("setup.footer")}
        />
      </Box>
    </Box>
  );
}

function KeyStep({
  provider,
  existingKey,
  onSaved,
}: {
  provider: ProviderId;
  existingKey?: string;
  onSaved: (key: string) => void;
}) {
  const [value, setValue] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prompt =
    provider === "deepseek"
      ? t("setup.apiKeyPrompt")
      : provider === "glm"
        ? t("setup.glmApiKeyPrompt")
        : t("setup.mimoApiKeyPrompt");
  const getOne =
    provider === "deepseek"
      ? t("setup.apiKeyGetOne")
      : provider === "glm"
        ? t("setup.glmApiKeyGetOne")
        : t("setup.mimoApiKeyGetOne");
  const validate =
    provider === "deepseek"
      ? validateDeepSeekApiKey
      : provider === "glm"
        ? validateGlmApiKey
        : validateMimoApiKey;
  const rejectedMsg =
    provider === "deepseek"
      ? t("setup.apiKeyRejected")
      : provider === "glm"
        ? t("setup.glmApiKeyRejected")
        : t("setup.mimoApiKeyRejected");

  const handleSubmit = (raw: string) => {
    const trimmed = raw.trim() || existingKey?.trim() || "";
    if (!isPlausibleKey(trimmed)) {
      setError(t("setup.apiKeyInvalid"));
      setValue("");
      return;
    }
    setChecking(true);
    setError(null);
    void validate(trimmed).then((result: ApiKeyValidationResult) => {
      setChecking(false);
      if (!result.ok) {
        setError(
          result.reason === "rejected"
            ? rejectedMsg
            : t("setup.apiKeyCheckFailed", { message: result.message ?? "unknown" }),
        );
        setValue("");
        return;
      }
      const cfg: DeepSeekSpecConfig = {
        ...readConfig(),
        provider,
        setupCompleted: false,
      };
      if (provider === "deepseek") {
        cfg.apiKey = trimmed;
      } else if (provider === "glm") {
        cfg.glm = { ...cfg.glm, apiKey: trimmed };
      } else {
        cfg.mimo = { ...cfg.mimo, apiKey: trimmed };
      }
      writeConfig(cfg);
      onSaved(trimmed);
    });
  };

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="ansi:cyan" paddingX={1}>
      <Text bold color="ansi:cyan">
        {t("setup.title")}
      </Text>
      <Box marginTop={1}>
        <Text>{prompt}</Text>
      </Box>
      <Text dim>{getOne}</Text>
      <Text dim>{t("setup.apiKeySavedLocally", { path: defaultConfigPath() })}</Text>
      {existingKey ? (
        <Text dim>{t("setup.apiKeyPreview", { redacted: redactKey(existingKey) })}</Text>
      ) : null}
      <Box marginTop={1}>
        <Text bold color="ansi:cyan">
          {t("setup.apiKeyInputLabel")}
        </Text>
        <TextInput
          value={value}
          onChange={setValue}
          onSubmit={handleSubmit}
          mask="•"
          placeholder="sk-..."
        />
      </Box>
      {checking ? (
        <Box marginTop={1}>
          <Text color="ansi:yellow">{t("setup.apiKeyChecking")}</Text>
        </Box>
      ) : error ? (
        <Box marginTop={1}>
          <Text color="ansi:red">{error}</Text>
        </Box>
      ) : value ? (
        <Box marginTop={1}>
          <Text dim>{t("setup.apiKeyPreview", { redacted: redactKey(value) })}</Text>
        </Box>
      ) : null}
      <Box marginTop={1}>
        <Text dim>{t("setup.footer")}</Text>
      </Box>
    </Box>
  );
}

function ModelStep({
  models,
  initial,
  onSubmit,
}: {
  models: readonly string[];
  initial?: string;
  onSubmit: (m: string) => void;
}) {
  const items: SelectItem<string>[] = models.map((m) => ({
    value: m,
    label: m,
    hint: m.includes("flash") || m.includes("turbo") ? "fast" : "capable",
  }));
  const defaultModel =
    (initial && models.includes(initial) ? initial : models[0]) ?? models[0] ?? "deepseek-v4-flash";
  return (
    <Box flexDirection="column" borderStyle="round" borderColor="ansi:cyan" paddingX={1}>
      <Text bold color="ansi:cyan">
        {t("setup.title")}
      </Text>
      <Box marginTop={1}>
        <Text>{t("setup.modelPrompt")}</Text>
      </Box>
      <Box marginTop={1}>
        <SingleSelect
          items={items}
          initialValue={defaultModel}
          onSubmit={onSubmit}
          onCancel={() => onSubmit(defaultModel)}
          footer={t("setup.footer")}
        />
      </Box>
    </Box>
  );
}

function ExitOnEnter({ onExit }: { onExit: () => void }) {
  useInput((_i, key) => {
    if (key.return) onExit();
  });
  return null;
}

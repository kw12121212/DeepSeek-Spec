import { Box, Text, useApp } from "ink";
import React, { useState } from "react";
import {
  type DeepSeekSpecConfig,
  type ProviderId,
  SUPPORTED_OFFICIAL_MODELS,
  defaultConfigPath,
  isPlausibleKey,
  readConfig,
  redactKey,
  writeConfig,
} from "../../config.js";
import { t } from "../../i18n/index.js";
import {
  type ApiKeyValidationResult,
  validateDeepSeekApiKey,
  validateGlmApiKey,
} from "../validate-api-key.js";
import { MaskedInput } from "./MaskedInput.js";
import { type SelectItem, SingleSelect } from "./Select.js";
import { COLOR, GLYPH, GRADIENT } from "./theme.js";

const DEEPSEEK_MODELS = SUPPORTED_OFFICIAL_MODELS.filter((m) => m.startsWith("deepseek-"));
const GLM_MODELS = SUPPORTED_OFFICIAL_MODELS.filter((m) => m.startsWith("glm-"));

type Step = "provider" | "key" | "model";

export interface SetupProps {
  onReady: (provider: ProviderId, key: string) => void;
}

export function Setup({ onReady }: SetupProps) {
  const [step, setStep] = useState<Step>("provider");
  const [provider, setProvider] = useState<ProviderId>("deepseek");

  const handleProvider = (p: ProviderId) => {
    setProvider(p);
    setStep("key");
  };

  const handleKeySaved = (key: string) => {
    const models = provider === "deepseek" ? DEEPSEEK_MODELS : GLM_MODELS;
    if (models.length > 0) {
      setStep("model");
    } else {
      onReady(provider, key);
    }
  };

  const handleModel = (_m: string) => {
    const cfg = readConfig();
    const savedKey = provider === "deepseek" ? cfg.apiKey : cfg.glm?.apiKey;
    onReady(provider, savedKey ?? "");
  };

  if (step === "provider") {
    return <ProviderPicker onSubmit={handleProvider} />;
  }

  if (step === "key") {
    return <KeyInput provider={provider} onSaved={handleKeySaved} />;
  }

  if (step === "model") {
    const models = provider === "deepseek" ? DEEPSEEK_MODELS : GLM_MODELS;
    return <ModelPicker models={models} onSubmit={handleModel} />;
  }

  return null;
}

function ProviderPicker({ onSubmit }: { onSubmit: (p: ProviderId) => void }) {
  const items: SelectItem<ProviderId>[] = [
    { value: "deepseek", label: t("wizard.providerDeepSeek"), hint: "platform.deepseek.com" },
    { value: "glm", label: t("wizard.providerGlm"), hint: "open.bigmodel.cn" },
  ];
  return (
    <Box flexDirection="column" paddingX={1} marginY={1}>
      <Box>
        <Text bold color={GRADIENT[0]}>
          {GLYPH.brand}
        </Text>
        <Text>{"  "}</Text>
        <Text bold>{t("wizard.welcomeTitle")}</Text>
      </Box>
      <Box marginTop={1}>
        <Text color={COLOR.info}>{t("wizard.providerPrompt")}</Text>
      </Box>
      <Box marginTop={1}>
        <SingleSelect
          items={items}
          initialValue="deepseek"
          onSubmit={onSubmit}
          onCancel={() => onSubmit("deepseek")}
        />
      </Box>
    </Box>
  );
}

function KeyInput({
  provider,
  onSaved,
}: {
  provider: ProviderId;
  onSaved: (key: string) => void;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const { exit } = useApp();

  const prompt = provider === "deepseek" ? t("wizard.apiKeyPrompt") : t("wizard.glmApiKeyPrompt");
  const getOne = provider === "deepseek" ? t("wizard.apiKeyGetOne") : t("wizard.glmApiKeyGetOne");
  const validate = provider === "deepseek" ? validateDeepSeekApiKey : validateGlmApiKey;
  const rejectedMsg =
    provider === "deepseek" ? t("wizard.apiKeyRejected") : t("wizard.glmApiKeyRejected");

  const handleSubmit = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed === "/exit" || trimmed === "/quit") {
      exit();
      return;
    }
    if (!isPlausibleKey(trimmed)) {
      setError(t("wizard.apiKeyInvalid"));
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
            : t("wizard.apiKeyCheckFailed", { message: result.message ?? "unknown" }),
        );
        setValue("");
        return;
      }
      const cfg: DeepSeekSpecConfig = { ...readConfig(), provider };
      if (provider === "deepseek") {
        cfg.apiKey = trimmed;
      } else {
        cfg.glm = { ...cfg.glm, apiKey: trimmed };
      }
      writeConfig(cfg);
      onSaved(trimmed);
    });
  };

  return (
    <Box flexDirection="column" paddingX={1} marginY={1}>
      <Box>
        <Text bold color={GRADIENT[0]}>
          {GLYPH.brand}
        </Text>
        <Text>{"  "}</Text>
        <Text bold>{t("wizard.welcomeTitle")}</Text>
      </Box>
      <Box marginTop={1}>
        <Text color={COLOR.info}>{prompt}</Text>
      </Box>
      <Box>
        <Text dim>{`  ${getOne}`}</Text>
      </Box>
      <Box>
        <Text dim>{t("wizard.apiKeySavedLocally", { path: defaultConfigPath() })}</Text>
      </Box>
      {checking ? (
        <Box marginTop={1}>
          <Text color={COLOR.info}>{t("wizard.apiKeyChecking")}</Text>
        </Box>
      ) : (
        <Box marginTop={1}>
          <Text bold color={COLOR.brand}>
            {GLYPH.bar}
          </Text>
          <Text bold color={COLOR.primary}>
            {" › "}
          </Text>
          <MaskedInput
            value={value}
            onChange={setValue}
            onSubmit={handleSubmit}
            mask="•"
            placeholder={t("wizard.apiKeyPlaceholder")}
          />
        </Box>
      )}
      {error ? (
        <Box marginTop={1}>
          <Text color={COLOR.err} bold>
            {GLYPH.err}
          </Text>
          <Text color={COLOR.err}>{`  ${error}`}</Text>
        </Box>
      ) : value ? (
        <Box marginTop={1}>
          <Text dim>{t("wizard.apiKeyPreview", { redacted: redactKey(value) })}</Text>
        </Box>
      ) : null}
      <Box marginTop={1}>
        <Text dim>{t("wizard.exitHint")}</Text>
      </Box>
    </Box>
  );
}

function ModelPicker({
  models,
  onSubmit,
}: {
  models: readonly string[];
  onSubmit: (m: string) => void;
}) {
  const items: SelectItem<string>[] = models.map((m) => ({
    value: m,
    label: m,
    hint: m.includes("flash") || m.includes("turbo") ? "fast" : "capable",
  }));
  const defaultModel = models[0] ?? "deepseek-v4-flash";
  return (
    <Box flexDirection="column" paddingX={1} marginY={1}>
      <Box>
        <Text bold color={GRADIENT[0]}>
          {GLYPH.brand}
        </Text>
        <Text>{"  "}</Text>
        <Text bold>{t("wizard.welcomeTitle")}</Text>
      </Box>
      <Box marginTop={1}>
        <Text color={COLOR.info}>{t("wizard.modelPrompt")}</Text>
      </Box>
      <Box marginTop={1}>
        <SingleSelect
          items={items}
          initialValue={defaultModel}
          onSubmit={onSubmit}
          onCancel={() => onSubmit(defaultModel)}
        />
      </Box>
    </Box>
  );
}

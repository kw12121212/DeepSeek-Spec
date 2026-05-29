/** `reasonix setup` — single-step API key prompt. */

import { Box, Text, render, useApp, useInput } from "ink";
import { TextInput } from "ink";
// biome-ignore lint/style/useImportType: JSX (jsx: "react") needs React as a runtime value
import React, { useState } from "react";
import {
  type DeepSeekSpecConfig,
  defaultConfigPath,
  isPlausibleKey,
  loadApiKey,
  readConfig,
  redactKey,
  writeConfig,
} from "../../config.js";
import { loadDotenv } from "../../env.js";
import { t } from "../../i18n/index.js";
import { type ApiKeyValidationResult, validateDeepSeekApiKey } from "../validate-api-key.js";

export interface SetupOptions {
  forceKeyStep?: boolean;
}

export async function setupCommand(_opts: SetupOptions = {}): Promise<void> {
  loadDotenv();
  const existingKey = loadApiKey();

  const { waitUntilExit, unmount } = render(
    <SetupPrompt
      existingKey={existingKey}
      onComplete={() => undefined}
      onCancel={() => unmount()}
    />,
    { exitOnCtrlC: true, patchConsole: false },
  );
  await waitUntilExit();
}

function SetupPrompt({
  existingKey,
  onComplete,
  onCancel,
}: {
  existingKey?: string;
  onComplete: () => void;
  onCancel: () => void;
}) {
  const { exit } = useApp();
  const [value, setValue] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useInput((_input, key) => {
    if (key.escape && !saved) onCancel();
  });

  if (saved) {
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

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="ansi:cyan" paddingX={1}>
      <Text bold color="ansi:cyan">
        {t("setup.title")}
      </Text>
      <Box marginTop={1}>
        <Text>{t("setup.apiKeyPrompt")}</Text>
      </Box>
      <Text dim>{t("setup.apiKeyGetOne")}</Text>
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
          onSubmit={(raw) => {
            const trimmed = raw.trim() || existingKey?.trim() || "";
            if (!isPlausibleKey(trimmed)) {
              setError(t("setup.apiKeyInvalid"));
              setValue("");
              return;
            }
            setChecking(true);
            setError(null);
            void validateDeepSeekApiKey(trimmed).then((result: ApiKeyValidationResult) => {
              setChecking(false);
              if (!result.ok) {
                setError(
                  result.reason === "rejected"
                    ? t("setup.apiKeyRejected")
                    : t("setup.apiKeyCheckFailed", { message: result.message ?? "unknown" }),
                );
                setValue("");
                return;
              }
              const cfg: DeepSeekSpecConfig = {
                ...readConfig(),
                apiKey: trimmed,
                setupCompleted: true,
              };
              writeConfig(cfg);
              setSaved(true);
              onComplete();
            });
          }}
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

function ExitOnEnter({ onExit }: { onExit: () => void }) {
  useInput((_i, key) => {
    if (key.return) onExit();
  });
  return null;
}

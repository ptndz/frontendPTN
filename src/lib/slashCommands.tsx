import React from "react";
import { type ChatComposerTrigger } from "@astryxdesign/core/Chat";
import { createStaticSource } from "@astryxdesign/core/Typeahead";
import { Stack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";

export interface SlashCommandDef {
  id: string;
  label: string;
  insert: string;
  descKey: string;
}

export const SLASH_COMMANDS: readonly SlashCommandDef[] = [
  { id: "task", label: "/task", insert: "/task ", descKey: "messenger.commands.taskDesc" },
  { id: "tasks", label: "/tasks", insert: "/tasks", descKey: "messenger.commands.tasksDesc" },
  { id: "done", label: "/done", insert: "/done ", descKey: "messenger.commands.doneDesc" },
  { id: "run", label: "/run", insert: "/run ", descKey: "messenger.commands.runDesc" },
  { id: "screen", label: "/screen", insert: "/screen", descKey: "messenger.commands.screenDesc" },
  { id: "nodes", label: "/nodes", insert: "/nodes", descKey: "messenger.commands.nodesDesc" },
  { id: "plan", label: "/plan", insert: "/plan ", descKey: "messenger.commands.planDesc" },
  { id: "status", label: "/status", insert: "/status", descKey: "messenger.commands.statusDesc" },
  { id: "help", label: "/help", insert: "/help", descKey: "messenger.commands.helpDesc" },
  { id: "info", label: "/info", insert: "/info", descKey: "messenger.commands.infoDesc" },
] as const;

export function createSlashCommandTrigger(t: (key: string) => string): ChatComposerTrigger {
  return {
    character: "/",
    searchSource: createStaticSource(
      SLASH_COMMANDS.map((c) => ({
        id: c.id,
        label: c.label,
        auxiliaryData: { description: t(c.descKey), insert: c.insert },
      }))
    ),
    renderItem: (item) => {
      const aux = item.auxiliaryData as
        | { description?: string; insert?: string }
        | undefined;
      return (
        <Stack gap={0}>
          <Text weight="semibold" size="sm">
            {item.label}
          </Text>
          <Text size="sm" color="secondary">
            {aux?.description}
          </Text>
        </Stack>
      );
    },
    onSelect: (item) =>
      (item.auxiliaryData as { insert?: string } | undefined)?.insert ??
      item.label,
    menuLabel: t("messenger.commands.menuLabel"),
    emptySearchText: t("messenger.commands.noResults"),
  };
}

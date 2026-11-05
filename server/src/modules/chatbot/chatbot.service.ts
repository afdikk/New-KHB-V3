import { prisma } from '../../config/prisma';
import { llmConfigured, ragChatConfigured } from '../../config/env';
import { getWorkspace } from '../../common/workspace';
import { ensureRagTarget } from '../rag-kms/rag.service';
import type { UpdateChatbotSettingsInput } from './chatbot.schema';

export interface ChatbotSettingsView {
  assistantName: string;
  greeting: string;
  language: string;
  tone: string;
  fallbackMode: string;
  showSources: boolean;
  autoEscalate: boolean;
  requestContact: boolean;
  allowGeneralKnowledge: boolean;
  generalDisclaimer: boolean;
  model: string | null;
  temperature: number;
  capabilities: {
    llmConfigured: boolean;
    ragChatConfigured: boolean;
    knowledgeBaseId: string | null;
    kmsOrganizationId: string | null;
    ragBackend: 'kms' | 'rag-chat' | 'none';
    canAnswerGeneral: boolean;
  };
}

export async function getChatbotSettings(slug: string): Promise<ChatbotSettingsView> {
  const workspace = await getWorkspace(slug);
  const settings = workspace.settings;

  // Info knowledge base dipakai panel untuk menampilkan sumber jawaban RAG.
  let rag: { knowledgeBaseId: string; organizationId: string | null; backend: 'kms' | 'rag-chat' | 'none' } | null =
    null;
  try {
    rag = await ensureRagTarget(workspace.id);
  } catch {
    rag = null;
  }

  return {
    ...settings,
    capabilities: {
      llmConfigured,
      ragChatConfigured,
      knowledgeBaseId: rag?.knowledgeBaseId ?? null,
      kmsOrganizationId: rag?.organizationId ?? null,
      ragBackend: rag?.backend ?? 'none',
      canAnswerGeneral: llmConfigured && settings.allowGeneralKnowledge,
    },
  };
}

export async function updateChatbotSettings(
  slug: string,
  input: UpdateChatbotSettingsInput,
): Promise<ChatbotSettingsView> {
  const workspace = await getWorkspace(slug);
  await prisma.chatbotSetting.update({ where: { workspaceId: workspace.id }, data: input });
  return getChatbotSettings(slug);
}

// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HomeExperience } from "@/features/home/HomeExperience";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("qualification journey", () => {
  it("keeps answers when returning to a previous step", async () => {
    const user = userEvent.setup();
    render(<HomeExperience />);

    await user.click(screen.getByRole("radio", { name: "Carro" }));
    await user.click(screen.getByRole("radio", { name: "Financiamento" }));
    await user.click(screen.getByRole("radio", { name: "R$20.000 – R$30.000" }));
    await user.click(screen.getByRole("button", { name: "Voltar" }));

    expect((screen.getByRole("radio", { name: "R$20.000 – R$30.000" }) as HTMLInputElement).checked).toBe(true);
    await user.click(screen.getByRole("radio", { name: "R$20.000 – R$30.000" }));
    expect(screen.getByRole("heading", { name: "Você tem valor de entrada?" })).toBeTruthy();
  });

  it("records the selected vehicle and moves attention to the form", async () => {
    const user = userEvent.setup();
    render(<HomeExperience />);

    await user.click(screen.getByRole("button", { name: /Volkswagen Virtus Comfortline/i }));

    expect(screen.getByText(/Interesse: Volkswagen Virtus/i)).toBeTruthy();
    expect(screen.getByRole("heading", { name: "O que você procura?" })).toBeTruthy();
  });

  it("requires an amount before continuing from a numeric question", async () => {
    const user = userEvent.setup();
    render(<HomeExperience />);
    await user.click(screen.getByRole("radio", { name: "Carro" }));
    await user.click(screen.getByRole("radio", { name: "Financiamento" }));
    await user.click(screen.getByRole("radio", { name: "R$20.000 – R$30.000" }));
    await user.click(screen.getByRole("radio", { name: "Sem entrada" }));
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByRole("heading", { name: "Qual valor de parcela cabe no seu orçamento?" })).toBeTruthy();
    expect(screen.getByRole("alert")).toBeTruthy();
  });

  it("submits contact information and shows success return notice", async () => {
    const user = userEvent.setup();
    render(<HomeExperience />);
    for (const name of ["Carro", "À vista", "R$20.000 – R$30.000"]) {
      await user.click(screen.getByRole("radio", { name }));
    }
    await user.type(screen.getByLabelText("Sua cidade"), "Sorocaba");
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await user.click(screen.getByRole("radio", { name: "Não" }));

    await user.type(screen.getByLabelText("Seu nome"), "Carlos Silva");
    await user.type(screen.getByLabelText("Seu WhatsApp"), "(15) 99888-7766");
    await user.click(screen.getByRole("button", { name: /Enviar e receber mensagem/i }));

    expect(screen.getByRole("heading", { name: /Solicitação enviada com sucesso!/i })).toBeTruthy();
    expect(screen.getByText(/retornar e mandar mensagem no seu WhatsApp/i)).toBeTruthy();
  });
});

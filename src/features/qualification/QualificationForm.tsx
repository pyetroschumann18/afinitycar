"use client";

import { useEffect, useRef, useState } from "react";
import { ContactStep, DetailStep, QualificationStep } from "./QualificationStep";
import { applyChoice, choices, getSteps, questions } from "./qualification.types";
import type { Answers, ChoiceKey, StepKey } from "./qualification.types";
import { vehicles } from "@/features/vehicles/vehicles";
import type { VehicleId } from "@/features/vehicles/vehicle.types";

type SubmitStatus = "idle" | "success";

function stepError(step: StepKey, answers: Answers): string | null {
  if (step === "city" && (answers.city?.trim().length ?? 0) < 2) return "Informe sua cidade.";
  if (step === "tradeVehicle" && (answers.tradeVehicleName?.trim().length ?? 0) < 2) return "Informe qual veículo você tem hoje.";
  if (step === "specificVehicle" && !answers.vehicleInterest && (answers.specificVehicleName?.trim().length ?? 0) < 2) return "Selecione ou descreva o veículo desejado.";
  if (step === "downPaymentAmount" || step === "monthlyPaymentAmount") {
    const text = answers[step];
    const amount = Number(text);
    const minimum = step === "monthlyPaymentAmount" ? 1 : 0;
    const maximum = step === "monthlyPaymentAmount" ? 1_000_000 : 10_000_000;
    if (!text?.trim() || !Number.isFinite(amount) || amount < minimum || amount > maximum) return "Informe um valor válido em reais.";
  }
  return null;
}

export function QualificationForm({ selectedVehicleId }: { selectedVehicleId: VehicleId | null }) {
  const [step, setStep] = useState<StepKey>("vehicleCategory");
  const [answers, setAnswers] = useState<Answers>(() => selectedVehicleId ? { vehicleCategory: "car", hasSpecificVehicle: "yes", vehicleInterest: selectedVehicleId } : {});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [error, setError] = useState("");
  const [submittedVehicleId, setSubmittedVehicleId] = useState<VehicleId | null>(null);
  const [previousSelectedVehicleId, setPreviousSelectedVehicleId] = useState<VehicleId | null>(selectedVehicleId);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const steps = getSteps(answers);
  const stepIndex = steps.indexOf(step);
  const choiceStep = step in choices ? step as ChoiceKey : null;
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === answers.vehicleInterest);
  const submittedVehicle = vehicles.find((vehicle) => vehicle.id === submittedVehicleId);

  if (selectedVehicleId && selectedVehicleId !== previousSelectedVehicleId) {
    setPreviousSelectedVehicleId(selectedVehicleId);
    setAnswers((current) => ({ ...current, vehicleCategory: "car", hasSpecificVehicle: "yes", vehicleInterest: selectedVehicleId, specificVehicleName: undefined }));
  }

  useEffect(() => {
    if (step !== "vehicleCategory") headingRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (status === "success") headingRef.current?.focus();
  }, [status]);

  function updateAnswer(field: keyof Answers, value: string) {
    setAnswers((current) => ({ ...current, [field]: value, ...(field === "specificVehicleName" ? { vehicleInterest: undefined } : {}) }));
    setError("");
  }

  function choose(key: ChoiceKey, value: string) {
    const next = applyChoice(answers, key, value);
    const nextSteps = getSteps(next);
    setAnswers(next);
    setError("");
    setCurrentStep(nextSteps[nextSteps.indexOf(key) + 1]);
  }

  function setCurrentStep(next: StepKey) {
    setStep(next);
  }

  function advance() {
    const problem = stepError(step, answers);
    if (problem) { setError(problem); return; }
    const next = steps[stepIndex + 1];
    if (next) { setError(""); setStep(next); }
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "success") return;
    if (!answers.name?.trim()) { setError("Informe seu nome."); return; }
    if (!answers.phone?.trim() || answers.phone.replace(/\D/g, "").length < 8) {
      setError("Informe seu WhatsApp com DDD.");
      return;
    }

    setSubmittedVehicleId(answers.vehicleInterest ?? null);
    setError("");
    setStatus("success");
  }

  return (
    <section id="qualificacao" className="qualification-section" aria-labelledby="qualification-heading">
      <div className="form-side-note"><span className="tiny-line" /> Atendimento guiado <span className="side-index">01 / 02</span></div>
      <div className="form-panel">
        <div className="form-intro">
          <div>
            <p className="section-kicker">Sua busca começa aqui</p>
            <p className="form-intro-text">Conte um pouco sobre o veículo que procura. Vamos entender seu momento antes de conversar.</p>
          </div>
        </div>

        {status === "success" ? (
          <div className="success-state" role="status">
            <div className="success-badge-wrapper">
              <span className="success-symbol" aria-hidden="true">✓</span>
            </div>
            <h1 id="qualification-heading" tabIndex={-1} ref={headingRef}>Solicitação enviada com sucesso!</h1>
            <p className="success-announcement">
              Obrigado, <strong>{answers.name || "amigo(a)"}</strong>! Já recebemos suas informações.
            </p>
            <div className="success-return-notice">
              <div className="notice-icon" aria-hidden="true">💬</div>
              <div className="notice-content">
                <strong>Aviso de atendimento:</strong>
                <p>Nossa equipe vai <strong>retornar e mandar mensagem no seu WhatsApp {answers.phone ? `(${answers.phone})` : ""}</strong> em instantes com as melhores opções para você!</p>
              </div>
            </div>
            {submittedVehicle && (
              <div className="success-vehicle-box">
                <span className="success-vehicle-label">Veículo selecionado:</span>
                <strong>{submittedVehicle.brand} {submittedVehicle.model} ({submittedVehicle.year})</strong>
              </div>
            )}
            <div className="success-actions">
              <button
                type="button"
                className="new-search-button"
                onClick={() => {
                  setStatus("idle");
                  setStep("vehicleCategory");
                  setAnswers({});
                  setSubmittedVehicleId(null);
                }}
              >
                Fazer nova consulta
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="progress-top"><span>Etapa {stepIndex + 1} de {steps.length}</span><span>{Math.round(((stepIndex + 1) / steps.length) * 100)}%</span></div>
            <div className="progress-track" role="progressbar" aria-valuenow={stepIndex + 1} aria-valuemin={1} aria-valuemax={steps.length} aria-label="Progresso do formulário"><span style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }} /></div>
            {selectedVehicle && <p className="selected-interest">Interesse: {selectedVehicle.brand} {selectedVehicle.model}</p>}
            <div key={`step-content-${step}`} className="step-animated-container">
              <h1 id="qualification-heading" className="question-heading" tabIndex={-1} ref={headingRef}>{questions[step]}</h1>
              <p className="question-helper">{step === "contact" ? "Informe seus dados para que nossa equipe retorne com o atendimento ideal." : choiceStep ? "Escolha a opção que mais combina com você." : "Preencha para continuar."}</p>
              {step === "contact" ? (
                <ContactStep answers={answers} onChange={updateAnswer} />
              ) : choiceStep ? (
                <QualificationStep step={choiceStep} value={answers[choiceStep]} onChange={(value) => choose(choiceStep, value)} />
              ) : (
                <DetailStep step={step as Exclude<StepKey, ChoiceKey | "contact">} answers={answers} onChange={updateAnswer} />
              )}
            </div>
            {error && <p role="alert" className="form-error">{error}</p>}
            <div className="form-actions">
              {stepIndex > 0 && <button className="back-button" type="button" onClick={() => { setStep(steps[stepIndex - 1]); setError(""); }}>Voltar</button>}
              {step === "contact" ? (
                <button className="next-button" type="submit">Enviar e receber mensagem<span aria-hidden="true">↗</span></button>
              ) : !choiceStep ? (
                <button className="next-button" type="button" onClick={advance}>Continuar<span aria-hidden="true">↗</span></button>
              ) : null}
            </div>
            <p className="form-footnote">🔒 Seus dados estão seguros. Retornaremos com uma mensagem personalizada no seu WhatsApp.</p>
          </form>
        )}
      </div>
    </section>
  );
}

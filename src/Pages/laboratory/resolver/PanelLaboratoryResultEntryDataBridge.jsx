/* ==========================================================
   PEFA LAB
   PANEL PARAMETER DATA BRIDGE

   PATH:
   src/pages/laboratory/resolver/PanelLaboratoryResultEntryDataBridge.jsx

   PURPOSE
   ----------------------------------------------------------
   Database-aware wrapper around the database-free panel
   resolver.

   This component is the ONLY place in the panel-routing layer
   that loads panel parameters.

   It passes one unified `parameters` contract downstream.
   ========================================================== */

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getPanelParameters,
} from "../../../services/laboratory/panelParameterService";

import PanelLaboratoryResultEntryResolver
  from "./PanelLaboratoryResultEntryResolver";

/* ----------------------------------------------------------
   DEMOGRAPHICS
   ---------------------------------------------------------- */

const toNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
};

const getAge = (
  patient = {},
  registration = {}
) => {
  const direct =
    toNumber(
      patient?.age ??
      patient?.patient_age ??
      registration?.age ??
      registration?.patient_age
    );

  if (direct !== null) {
    return direct;
  }

  const dob =
    patient?.dob ??
    patient?.date_of_birth ??
    patient?.dateOfBirth ??
    registration?.dob ??
    registration?.date_of_birth ??
    registration?.dateOfBirth;

  if (!dob) return null;

  const date = new Date(dob);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const today = new Date();

  let age =
    today.getFullYear() -
    date.getFullYear();

  const month =
    today.getMonth() -
    date.getMonth();

  if (
    month < 0 ||
    (
      month === 0 &&
      today.getDate() < date.getDate()
    )
  ) {
    age -= 1;
  }

  return age;
};

const getSex = (
  patient = {},
  registration = {}
) =>
  patient?.sex ??
  patient?.gender ??
  patient?.patient_sex ??
  registration?.sex ??
  registration?.gender ??
  registration?.patient_sex ??
  "";

/* ----------------------------------------------------------
   COMPONENT
   ---------------------------------------------------------- */

export default function PanelLaboratoryResultEntryDataBridge({
  test,
  result,
  registration,
  patient,

  demographics: suppliedDemographics,

  onSaved,
  onChange,
  onSave,
  onCancel,
  onBack,

  readOnly = false,
  disabled = false,
  editMode = false,

  ...rest
}) {
  const demographics = useMemo(() => ({
    age:
      suppliedDemographics?.age ??
      getAge(patient, registration),

    sex:
      suppliedDemographics?.sex ??
      getSex(patient, registration),
  }), [
    suppliedDemographics?.age,
    suppliedDemographics?.sex,
    patient,
    registration,
  ]);

  const panelName =
    test?.panel_name ??
    test?.panelName ??
    test?.masterTest?.panel_name ??
    test?.master_test?.panel_name ??
    test?.test_name ??
    "";

  const panelId =
    test?.panel_id ??
    test?.panelId ??
    test?.parent_panel_id ??
    test?.parentPanelId ??
    test?.masterTest?.panel_id ??
    test?.master_test?.panel_id ??
    null;

  const [state, setState] = useState({
    parameters: [],
    panelName,
    panelId,
    source: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    setState({
      parameters: [],
      panelName,
      panelId,
      source: null,
      loading: true,
      error: null,
    });

    (async () => {
      try {
        const resolved =
          await getPanelParameters({
            test,
            panelName,
            panelId,
            demographics,
          });

        if (cancelled) return;

        setState({
          parameters:
            resolved.parameters || [],
          panelName:
            resolved.panelName ||
            panelName,
          panelId:
            resolved.panelId ??
            panelId ??
            null,
          source:
            resolved.source ??
            null,
          loading: false,
          error:
            resolved.error ??
            null,
        });
      } catch (error) {
        if (cancelled) return;

        setState({
          parameters: [],
          panelName,
          panelId,
          source: null,
          loading: false,
          error:
            error?.message ||
            "Failed to load panel parameters.",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    test,
    panelName,
    panelId,
    demographics.age,
    demographics.sex,
  ]);

  return (
    <PanelLaboratoryResultEntryResolver
      test={test}
      result={result}
      registration={registration}
      patient={patient}

      parameters={state.parameters}
      parameterSource={state.source}
      parameterLoading={state.loading}
      parameterError={state.error}

      demographics={demographics}

      onSaved={onSaved}
      onChange={onChange}
      onSave={onSave}
      onCancel={onCancel}
      onBack={onBack}

      readOnly={readOnly}
      disabled={disabled}
      editMode={editMode}

      {...rest}
    />
  );
}

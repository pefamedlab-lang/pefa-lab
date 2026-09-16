import React, { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Database, Loader2 } from "lucide-react";
import { supabase } from "../../supabase";

const CACHE_PREFIX = "pefa:laboratory-result-entry:";

const txt = (v) => v == null ? "" : String(v).trim();
const norm = (v) => txt(v).toLowerCase().replace(/[()]/g," ").replace(/[\\/]/g," ").replace(/[._-]+/g," ").replace(/\s+/g," ").trim();

const parseResult = (v) => {
  if (v == null || v === "") return null;
  if (typeof v === "object") return v;
  if (typeof v === "string") {
    try { return JSON.parse(v); } catch { return v.trim() || null; }
  }
  return v;
};

const hasPayload = (v) => {
  const x = parseResult(v);
  if (x == null || x === "") return false;
  if (typeof x === "string") return x.trim() !== "";
  if (typeof x === "number" || typeof x === "boolean") return true;
  if (Array.isArray(x)) return x.some(hasPayload);
  if (typeof x === "object") {
    return Object.entries(x).some(([k,val]) => !k.startsWith("__pefa") && hasPayload(val));
  }
  return false;
};

const savedStatus = (v) =>
  ["performed","verified","authorized","released","completed"].includes(norm(v));

const testName = (test) => txt(
  test?._registeredTestName || test?.test_name ||
  test?.masterTest?.test_name || test?.master_test?.test_name || test?.name
);

const testCode = (test) => txt(
  test?._registeredTestCode || test?.test_code ||
  test?.masterTest?.test_code || test?.master_test?.test_code || test?.code
);

const labNumber = (registration) => txt(
  registration?.lab_number || registration?.labNo ||
  registration?.lab_no || registration?.laboratory_number ||
  registration?.laboratory_no
);

const matchesTest = (row, test) => {
  if (!row) return false;
  const rn=norm(row.test_name), rc=norm(row.test_code);
  const tn=norm(testName(test)), tc=norm(testCode(test));
  return (tc && rc && tc===rc) || (tn && rn && tn===rn);
};

const choose = (rows) => {
  if (!rows?.length) return null;
  const meaningful=rows.filter(r=>hasPayload(r.result)||savedStatus(r.result_status));
  const pool=meaningful.length ? meaningful : rows;
  return [...pool].sort((a,b)=>{
    const ad=new Date(a?.updated_at||a?.created_at||0).getTime()||0;
    const bd=new Date(b?.updated_at||b?.created_at||0).getTime()||0;
    return bd-ad || Number(b?.id||0)-Number(a?.id||0);
  })[0] || null;
};

const readCache=(id)=>{
  if(!id || typeof window==="undefined") return null;
  try {
    const raw=window.localStorage.getItem(`${CACHE_PREFIX}${id}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export default function SavedResultHydrator({
  registration, test, result, onHydrated, onStateChange
}) {
  const [state,setState]=useState({
    loading:false, found:false, payloadFound:false,
    resultId:result?.id||null, source:"none", error:""
  });
  const lastSignature=useRef("");

  const key=useMemo(()=>[
    registration?.id||"", labNumber(registration),
    testName(test), testCode(test), result?.id||""
  ].join("|"),[
    registration?.id, labNumber(registration),
    testName(test), testCode(test), result?.id
  ]);

  useEffect(()=>{
    let cancelled=false;

    const run=async()=>{
      if(!registration?.id || !test) return;

      setState(p=>({...p,loading:true,error:""}));

      try {
        const rid=Number(registration.id);
        if(!Number.isFinite(rid)) throw new Error("Invalid registration ID.");

        let rows=[];

        // 1. Exact laboratory_results.id.
        if(result?.id){
          const {data,error}=await supabase
            .from("laboratory_results")
            .select("*")
            .eq("id",result.id)
            .maybeSingle();
          if(error) throw error;
          if(data?.id) rows=[data];
        }

        // 2. Every result belonging to this registration.
        if(!rows.length){
          const {data,error}=await supabase
            .from("laboratory_results")
            .select("*")
            .eq("registration_id",rid);
          if(error) throw error;
          rows=Array.isArray(data) ? data.filter(r=>matchesTest(r,test)) : [];
        }

        // 3. Legacy Lab Number fallback.
        if(!rows.length && labNumber(registration)){
          const {data,error}=await supabase
            .from("laboratory_results")
            .select("*")
            .eq("lab_number",labNumber(registration));
          if(error) throw error;
          rows=Array.isArray(data) ? data.filter(r=>matchesTest(r,test)) : [];
        }

        let best=choose(rows);
        let source=best ? "database" : "none";

        // 4. Browser cache is only a fallback for the exact result row.
        if(best && !hasPayload(best.result) && !savedStatus(best.result_status)){
          const cached=readCache(best.id);
          if(cached && hasPayload(cached.result)){
            best={
              ...best,
              result:parseResult(cached.result),
              result_status:best.result_status||cached.result_status||"Performed"
            };
            source="verified-cache";
          }
        }

        if(!best){
          const next={loading:false,found:false,payloadFound:false,resultId:result?.id||null,source,error:"No laboratory result record found for this test."};
          if(!cancelled){setState(next);onStateChange?.(next);}
          return;
        }

        const hydrated={...best,result:parseResult(best.result)};
        const signature=`${hydrated.id}|${JSON.stringify(hydrated.result??null)}|${hydrated.result_status||""}`;

        if(signature!==lastSignature.current){
          lastSignature.current=signature;
          onHydrated?.(hydrated);
        }

        const next={
          loading:false,
          found:true,
          payloadFound:hasPayload(hydrated.result)||savedStatus(hydrated.result_status),
          resultId:hydrated.id,
          source,
          error:""
        };
        if(!cancelled){setState(next);onStateChange?.(next);}
      }catch(error){
        if(cancelled) return;
        const next={
          loading:false,found:false,payloadFound:false,
          resultId:result?.id||null,source:"error",
          error:error?.message||"Unable to retrieve saved result."
        };
        setState(next);
        onStateChange?.(next);
      }
    };

    run();
    return()=>{cancelled=true;};
  },[key]);

  return (
    <div className="pefa-hydrator-diagnostic" aria-live="polite">
      <div className="pefa-hydrator-diagnostic__item">
        {state.loading?<Loader2 size={14} className="pefa-hydrator-spin"/>:<Database size={14}/>}
        <span>RESULT RECORD</span>
        <strong>{state.loading?"CHECKING…":state.found?"FOUND":"NOT FOUND"}</strong>
      </div>
      <div className="pefa-hydrator-diagnostic__item">
        {state.payloadFound?<CheckCircle2 size={14}/>:<AlertCircle size={14}/>}
        <span>SAVED VALUE</span>
        <strong>{state.loading?"CHECKING…":state.payloadFound?"FOUND":"EMPTY"}</strong>
      </div>
      <div className="pefa-hydrator-diagnostic__item">
        <Database size={14}/>
        <span>SOURCE</span>
        <strong>{state.source.toUpperCase()}</strong>
      </div>
      {state.resultId && <div className="pefa-hydrator-diagnostic__id">Result ID: {state.resultId}</div>}
      {state.error && <div className="pefa-hydrator-diagnostic__error">{state.error}</div>}
    </div>
  );
}

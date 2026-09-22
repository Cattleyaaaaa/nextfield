"use client";
import {useCallback,useEffect,useState} from "react";
import {LEARNING_TRACKS,lessonKey} from "@/lib/learn-data";
const STORAGE_KEY="nextfield-learning-progress";
const EVENT_NAME="nextfield-learning-progress";
const valid=LEARNING_TRACKS.flatMap(t=>t.lessons.map(l=>lessonKey(t.slug,l.slug)));
export function localProgress():string[]{try{const v=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");return Array.isArray(v)?v.filter(k=>valid.includes(k)):[];}catch{return [];}}
export function useLearningProgress(){
 const [completed,setCompleted]=useState<string[]>([]),[ready,setReady]=useState(false),[cloud,setCloud]=useState(false),[error,setError]=useState(false);
 const read=useCallback(async()=>{
  try{
   const response=await fetch("/api/school/session");if(!response.ok)throw Error();const s=await response.json();
   setCloud(Boolean(s.user));
   if(s.user){const r=await fetch("/api/school/records");if(!r.ok)throw Error();const b=await r.json();setCompleted(b.progress);}
   else setCompleted(localProgress());
   setError(false);
  }catch{setCompleted([]);setError(true);}finally{setReady(true);}
 },[]);
 useEffect(()=>{void read();window.addEventListener(EVENT_NAME,read);window.addEventListener("storage",read);return()=>{window.removeEventListener(EVENT_NAME,read);window.removeEventListener("storage",read);};},[read]);
 const complete=useCallback(async(key:string)=>{
  if(!valid.includes(key))return;
  try{
   const response=await fetch("/api/school/session");if(!response.ok)throw Error();const s=await response.json();
   if(s.user){const r=await fetch("/api/school/records",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind:"progress",keys:[key]})});if(!r.ok)throw Error();}
   else localStorage.setItem(STORAGE_KEY,JSON.stringify([...new Set([...localProgress(),key])]));
   window.dispatchEvent(new Event(EVENT_NAME));setError(false);
  }catch{setError(true);}
 },[]);
 return {completed,complete,ready,cloud,error};
}

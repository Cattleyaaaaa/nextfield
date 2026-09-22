import "server-only";
import {supabase} from "./school-server";
export const uuid=(id:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
export async function publicProfile(id:string){
 if(!uuid(id))return null;
 const rows=await supabase(`/rest/v1/school_profiles?user_id=eq.${id}&is_public=eq.true&select=user_id,display_name,bio`,undefined,{},true);
 return rows[0]||null;
}

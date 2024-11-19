import {createContext} from 'react';
import { createClient } from '@supabase/supabase-js'

export const GlobalContext = createContext();

export const GlobalProvider = ({children}) => {
    const supabaseUrl = 'https://lvwohhiuepsixbzuhqnw.supabase.co'
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2d29oaGl1ZXBzaXhienVocW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4NDIyOTUsImV4cCI6MjA0NzQxODI5NX0.EC1_iNZeVotR7AjUIjUzeptTS-FDeAAUpEkoxfnoOzI";
    const supabase = createClient(supabaseUrl, supabaseKey);
    return (
        <GlobalContext.Provider value={{ 
          supabase 
        }}>
          {children}
        </GlobalContext.Provider>
      );
}
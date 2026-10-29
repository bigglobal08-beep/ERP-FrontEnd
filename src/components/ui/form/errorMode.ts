"use client";

import { createContext, useContext } from "react";

// toast: el mensaje de error se muestra en un toast | inline: debajo del campo
export type ErrorMode = "toast" | "inline";

// Fuera de un FormLayout (p. ej. un FormProvider propio) se muestran inline para no perderlos
export const ErrorModeContext = createContext<ErrorMode>("inline");

export const useErrorMode = () => useContext(ErrorModeContext);

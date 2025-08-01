import React from "react"

const DeniedPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <h1 className="text-4xl font-bold">Acceso Denegado</h1>
      <p className="mt-3 text-xl">No tienes permiso para acceder a esta página.</p>
      <a href="/" className="mt-5 text-blue-500 hover:underline">Volver al inicio</a>
    </div>
  )
}

export default DeniedPage



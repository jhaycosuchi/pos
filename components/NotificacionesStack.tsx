'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

export interface Notificacion {
  id: string;
  tipo: 'exito' | 'error' | 'advertencia' | 'info';
  titulo: string;
  mensaje: string;
  duracion?: number; // ms, 0 = manual
  accion?: {
    texto: string;
    onClick: () => void;
  };
}

interface NotificacionesProviderProps {
  notificaciones: Notificacion[];
  onDismiss: (id: string) => void;
}

const iconos = {
  exito: <CheckCircle2 className="w-5 h-5 text-green-400" />,
  error: <XCircle className="w-5 h-5 text-red-400" />,
  advertencia: <AlertCircle className="w-5 h-5 text-yellow-400" />,
  info: <Bell className="w-5 h-5 text-blue-400" />,
};

const colores = {
  exito: 'bg-green-950/50 border-green-600/50',
  error: 'bg-red-950/50 border-red-600/50',
  advertencia: 'bg-yellow-950/50 border-yellow-600/50',
  info: 'bg-blue-950/50 border-blue-600/50',
};

export default function NotificacionesStack({
  notificaciones,
  onDismiss,
}: NotificacionesProviderProps) {
  useEffect(() => {
    const timers = notificaciones.map((notif) => {
      if (notif.duracion !== 0) {
        const timeout = setTimeout(() => {
          onDismiss(notif.id);
        }, notif.duracion || 5000);
        return { id: notif.id, timeout };
      }
      return null;
    });

    return () => {
      timers.forEach((timer) => {
        if (timer) clearTimeout(timer.timeout);
      });
    };
  }, [notificaciones, onDismiss]);

  return (
    <div className="fixed top-4 right-4 z-[999] flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {notificaciones.map((notif, index) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 400, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ duration: 0.3 }}
            className={`border rounded-lg p-4 flex items-start gap-3 ${colores[notif.tipo]}`}
          >
            <div className="flex-shrink-0 mt-0.5">{iconos[notif.tipo]}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm">{notif.titulo}</h3>
              <p className="text-gray-300 text-xs mt-1">{notif.mensaje}</p>
              {notif.accion && (
                <button
                  onClick={() => {
                    notif.accion!.onClick();
                    onDismiss(notif.id);
                  }}
                  className="mt-2 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {notif.accion.texto}
                </button>
              )}
            </div>
            <button
              onClick={() => onDismiss(notif.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-200 transition-colors"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

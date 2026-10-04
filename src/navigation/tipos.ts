/** Rutas de la app (stack principal). */
export type RutasApp = {
  Login: undefined;
  Estudiantes: undefined;
  /** Sin `id` = crear · con `id` = editar */
  FormularioEstudiante: { id?: string };
  Perfil: undefined;
};
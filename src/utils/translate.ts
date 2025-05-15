const auth_message1 =
  'Ya tiene una sesión abierta en otro dispositivo. Por motivos de seguridad no permitimos varias sesiones con las mismas credenciales.';
const auth_message2 =
  'No tiene una sesión abierta en este dispositivo o venció el tiempo de expiración.';
const auth_message3 = 'Usuario o contraseña incorrectos.';
const auth_message4 = 'Error en la autenticación.';
const auth_message5 = 'Token inhexistente';
const auth_message6 = 'No se pudo crear la cuenta. Puede que ya exista un usuario con esos datos.';
const auth_message7 = 'No tiene autorización para acceder a este servicio.';
///////////////////////////////////////////////////////////////////////////////
const no_found_message1 = 'No existe este producto.';
const no_found_message2 = 'No existe este usuario.';
const no_found_message3 = 'No existe este negocio.';
const no_found_message4 = 'No existe esta sesión.';
const no_found_message5 = 'No existe esta orden de compra.';
const no_found_message6 = 'No existe esta factura.';
const no_found_message7 = 'El negocio ya existe o hay una solicitud con el mismo nombre.';
const no_found_message8 = 'No existe este repartidor.';
const no_found_message9 = 'No existe esta cancelación de pago.';
const no_found_message10 = 'No existe este pago.';
const no_found_message11 = 'No existe esta liquidación de pago.';
const no_found_message12 = 'No existe una entrega configurada para esta orden de compra.';
const no_found_message13 = 'No existe esta categoría.';
const no_found_message14 = 'No existe este clasificador.';
const no_found_message15 = 'no existe carro de compras';
const no_found_message16 = 'no existe esta promo.';

///////////////////////////////////////////////////////////////////////////////
const can_not_message1 = 'No está autorizado a cambiar el estado a ENTREGADO.';
const can_not_message2 = 'No está autorizado a cambiar el estado de EN CONSTRUCCIÓN.';
const can_not_message3 = 'No se puede cambiar el mensajero de una entrega en proceso o finalizada.';
const can_not_message4 =
  'No se puede cambiar el mensajero de una orden de compra sin mensajería solicitada.';
const can_not_message5 = 'La entrega no puede ser iniciada desde el estado actual.';
const can_not_message6 = 'No está autorizado a cambiar el estado de una entrega en proceso.';
const can_not_message7 = 'No está autorizado a cambiar el estado de esta orden de compra.';
const can_not_message8 =
  'No se puede modificar una orden de compra que no esté en EN CONSTRUCCIÓN.';

export const translateES = {
  [auth_message1]: auth_message1,
  [auth_message2]: auth_message2,
  [auth_message3]: auth_message3,
  [auth_message4]: auth_message4,
  [auth_message5]: auth_message5,
  [auth_message6]: auth_message6,
  [auth_message7]: auth_message7,
  ///////////////////////////////////////////////////////////////////////////////
  [no_found_message1]: no_found_message1,
  [no_found_message2]: no_found_message2,
  [no_found_message3]: no_found_message3,
  [no_found_message4]: no_found_message4,
  [no_found_message5]: no_found_message5,
  [no_found_message6]: no_found_message6,
  [no_found_message7]: no_found_message7,
  [no_found_message8]: no_found_message8,
  [no_found_message9]: no_found_message9,
  [no_found_message10]: no_found_message10,
  [no_found_message11]: no_found_message11,
  [no_found_message12]: no_found_message12,
  [no_found_message13]: no_found_message13,
  [no_found_message14]: no_found_message14,
  [no_found_message15]: no_found_message15,
  [no_found_message16]: no_found_message16,

  ///////////////////////////////////////////////////////////////////////////////
  [can_not_message1]: can_not_message1,
  [can_not_message2]: can_not_message2,
  [can_not_message3]: can_not_message3,
  [can_not_message4]: can_not_message4,
  [can_not_message5]: can_not_message5,
  [can_not_message6]: can_not_message6,
  [can_not_message7]: can_not_message7,
  [can_not_message8]: can_not_message8
};

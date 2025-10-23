/**
 * Index de todos los modelos Mongoose
 * 
 * Exporta todos los modelos del sistema para facilitar su importación
 * 
 * Uso:
 * const { User, Script, RunOrder } = require('./models');
 */

const User = require('./User.model');
const Script = require('./Script.model');
const RunOrder = require('./RunOrder.model');
const Configuration = require('./Configuration.model');
const Macro = require('./Macro.model');
const Collaboration = require('./Collaboration.model');
const AuditLog = require('./AuditLog.model');
const Session = require('./Session.model');

module.exports = {
  User,
  Script,
  RunOrder,
  Configuration,
  Macro,
  Collaboration,
  AuditLog,
  Session
};

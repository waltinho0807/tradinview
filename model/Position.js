const mongoose = require('mongoose');

const Position = mongoose.Schema(
    {
      comprado: Boolean,
      vendido: Boolean
    },
    {
      timestamps: true,
    }
  );
  
  module.exports =  mongoose.models.Position || mongoose.model("Position", Position);
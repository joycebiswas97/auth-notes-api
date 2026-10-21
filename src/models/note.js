const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title:{
      type:String,
      required: [true,'Title is required'],
      trim:true,
      maxLength: [100, 'Title cannot exceed 100 characters']
    },
    content:{
      type: String,
      required:[true,'Content field cannot be empty']
    },
    user:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    }
  },
  {timestamps: true}
);

const Note = mongoose.model('Note', noteSchema);
module.exports = Note;
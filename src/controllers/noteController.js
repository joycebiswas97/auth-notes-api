const Note = require('../models/note');

const createNote = async(req,res) => {
  try{
    const {title, content} = req.body;
    if(!title || !content){
      return res.status(400).json({error:'Please provide both title and content'});
    }
    const note = await Note.create({
      title,
      content,
      user:req.user._id
    });
    return res.status(201).json({message:'Note created succesfully', note});
  }
  catch(error){
    console.error('Cannot create note:', error);
    return res.status(500).json({error: 'Internal server error'});
  }
};

const getMyNotes = async(req,res) => {
  try{
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 5));
    const skip = (page-1)*limit;

    const filter = {user:req.user._id};

    if(req.query.search && req.query.search.trim() !== ''){
      const searchKeyword = req.query.search.trim();
      const sanitizedKeyword = searchKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const searchRegex = { $regex:sanitizedKeyword, $options:'i'};

      filter.$or = [
        {title:searchRegex},
        {content:searchRegex}
      ]
    }

    const [notesCount, notes] = await Promise.all([
      Note.countDocuments(filter),
      Note.find(filter)
      .sort({createdAt: -1})
      .skip(skip)
      .limit(limit)
    ]);

    const totalPages = Math.ceil(notesCount/limit);

    return res.status(200).json({
      pagination:{
        totalNotes:notesCount,
        totalPages,
        currentPage:page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        searchQuery: req.query.search? req.query.search.trim() : null
      },
      notes
    })
  }
  catch(error){
    console.error('Error fetching note:', error);
    return res.status(500).json({error: 'Internal server error'});
  }
};

const getNoteById = async(req,res) => {
  try{
    const note = await Note.findById(req.params.id);
    if(!note){
      return res.status(404).json("Note not found");
    }
    if(note.user.toString() !== req.user._id.toString()){
      return res.status(403).json({error: 'forbidden: You donot own this note'});
    }
    return res.status(200).json({note});
  }
  catch(error){
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid note ID format' });
    }
    console.error('Error fetching note:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updateNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden: You do not own this note' });
    }

    if (title) note.title = title;
    if (content) note.content = content;

    const updatedNote = await note.save();

    return res.status(200).json({
      message: 'Note updated successfully',
      note: updatedNote
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid note ID format' });
    }
    console.error('Error updating note:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden: You do not own this note' });
    }

    await note.deleteOne();

    return res.status(200).json({
      message: 'Note deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid note ID format' });
    }
    console.error('Error deleting note:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createNote,
  getMyNotes,
  getNoteById,
  updateNote,
  deleteNote
};
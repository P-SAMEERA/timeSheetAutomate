import mongoose from 'mongoose';

const taskSchema = mongoose.Schema({
    tasks:{
        type:[String],
        required:true
    }
},{timestamp:true});

const Tasks = mongoose.model(taskSchema,"TASK");

export default Tasks;
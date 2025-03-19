import { Task } from "../types";

export const calculateProgress = (task: Task) => {
    return Math.min(
        Math.max(
            (((new Date().getTime() - task.startDateTime.getTime()) / 
            (task.endDateTime.getTime() - task.startDateTime.getTime())) * 100)
        , 0)
    , 100);
}
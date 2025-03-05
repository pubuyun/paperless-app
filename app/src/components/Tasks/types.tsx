export enum TaskStatus {
    NOT_STARTED = 'NOT_STARTED',
    IN_PROGRESS = 'IN_PROGRESS',
    STUCK = 'STUCK',
}   

export enum StatusColor {
    NOT_STARTED = 'yellow',
    IN_PROGRESS = 'blue',
    STUCK = 'red',
}

export enum Subject {
    MATH = 'MATH',
    ENGLISH = 'ENGLISH',
    ECONOMICS = 'ECONOMICS',
    PHYSICS = 'PHYSICS',
    CHEMISTRY = 'CHEMISTRY',
    BIOLOGY = 'BIOLOGY',
    HISTORY = 'HISTORY',
    COMPUTER_SCIENCE = 'COMPUTER SCIENCE',
    ART = 'ART',
    MUSIC = 'MUSIC',
    PHYSICAL_EDUCATION = 'PHYSICAL EDUCATION',
    OTHER = 'OTHER',
}

export interface Task {
    id: number;
    title: string;
    status: TaskStatus;
    done: boolean;
    subject: Subject;
    startDateTime: Date;
    endDateTime: Date;
    url: string;
}

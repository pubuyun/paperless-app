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

export enum TimeSelector {
    TODAY = 'TODAY',
    TOMORROW = 'TOMORROW',
    THIS_WEEK = 'THIS_WEEK',
}

export enum Subject {
    MATH = 'MATH',
    ENGLISH = 'ENGLISH',
    ECONOMICS = 'ECONOMICS',
    PHYSICS = 'PHYSICS',
    CHEMISTRY = 'CHEMISTRY',
    BIOLOGY = 'BIOLOGY',
    HISTORY = 'HISTORY',
    COMPUTER_SCIENCE = 'COMPUTER_SCIENCE',
    ART = 'ART',
    MUSIC = 'MUSIC',
    PHYSICAL_EDUCATION = 'PHYSICAL_EDUCATION',
    OTHER = 'OTHER',
}

export enum SubjectColor {
    MATH = 'yellow',
    ENGLISH = 'blue',
    ECONOMICS = 'red',
    PHYSICS = 'green',
    CHEMISTRY = 'purple',
    BIOLOGY = 'orange',
    HISTORY = 'pink',
    COMPUTER_SCIENCE = 'cyan',
    ART = 'brown',
    MUSIC = 'grey',
    PHYSICAL_EDUCATION = 'teal',
    OTHER = 'black',
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

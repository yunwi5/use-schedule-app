export function getImportanceValue(importance: string) {
    switch (importance) {
        case Importance.EXTRA:
            return 1;
        case Importance.TRIVIAL:
            return 2;
        case Importance.NICE_TO_HAVE:
            return 3;
        case Importance.IMPORTANT:
            return 4;
        case Importance.CRUCIAL:
            return 5;
        default:
            return -1;
    }
}

export function getImportanceName(value: number) {
    switch (value) {
        case 1:
            return Importance.EXTRA;
        case 2:
            return Importance.TRIVIAL;
        case 3:
            return Importance.NICE_TO_HAVE;
        case 4:
            return Importance.IMPORTANT;
        case 5:
            return Importance.CRUCIAL;
        default:
            return Importance.EXTRA;
    }
}

export enum Importance {
    EXTRA = 'Extra',
    TRIVIAL = 'Trivial',
    NICE_TO_HAVE = 'Nice to have',
    IMPORTANT = 'Important',
    CRUCIAL = 'Crucial',
}

export const ImportanceList = [
    Importance.CRUCIAL,
    Importance.IMPORTANT,
    Importance.NICE_TO_HAVE,
    Importance.TRIVIAL,
    Importance.EXTRA,
];

export function isImportance(imp: string) {
    const importanceList: string[] = ImportanceList;
    return importanceList.includes(imp);
}

export enum Status {
    OPEN = 'Open',
    CANCELLED = 'Cancelled',
    IN_PROGRESS = 'In Progress',
    COMPLETED = 'Completed',
    OVERDUE = 'Overdue',
}

export const StatusList = [
    Status.OPEN,
    Status.CANCELLED,
    Status.IN_PROGRESS,
    Status.COMPLETED,
    Status.OVERDUE,
];

export function isStatus(str: string) {
    const statusList: string[] = StatusList;
    return statusList.includes(str);
}

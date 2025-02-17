import { createContext, useContext, useMemo, useState } from 'react';
import useWindowInnerWidth from '../../hooks/useWindowInnerWidth';
import { WeeklyPlanner } from '../../models/planner-models/WeeklyPlanner';
import { AbstractTask } from '../../models/task-models/AbstractTask';
import { TemplatePlanner } from '../../models/template-models/TemplatePlanner';
import { MOBILE_BREAKPOINT } from '../../utilities/device-util';
import {
    getInitialTimeLineFreqMap,
    TimeLineFreqMap,
} from '../../utilities/gen-utils/time-util';

interface ITimeTableContext {
    cellHeight: number; // unit should be rem
    minCellWidth: number;
    emptyCellHeight: number;
    // planner: WeeklyPlanner | TemplatePlanner | null;
    getTopOffset: (hours: number, minutes?: number) => string;
    getCellHeight: (hours: number) => string;
    getTaskHeight: (task: AbstractTask) => string;
    getTotalTableHeight: () => string;
}

const TimeTableContext = createContext<ITimeTableContext>({
    cellHeight: 10,
    minCellWidth: 8.375,
    emptyCellHeight: 2.5,
    getTopOffset: () => '0rem',
    getCellHeight: (hours: number) => '0rem',
    getTaskHeight: (task: AbstractTask) => '0rem',
    getTotalTableHeight: () => '0rem',
});

export const useTimeTableContext = () => useContext(TimeTableContext);

interface Props {
    planner: WeeklyPlanner | TemplatePlanner;
    defaultCellHeight?: number;
}

const DEFAULT_CELL_HEIGHT = 10; // unit in rem

export const TimeTableContextProvider: React.FC<Props> = ({
    children,
    planner,
    defaultCellHeight,
}) => {
    // units in rem
    const initialCellHeight = defaultCellHeight ?? DEFAULT_CELL_HEIGHT;
    const [cellHeight, setCellHeight] = useState<number>(initialCellHeight);
    const minCellWidth = 8.375;
    const emptyCellHeight = 3;

    useWindowInnerWidth({
        breakPoint: MOBILE_BREAKPOINT,
        belowBreakPointCallback: () => setCellHeight(initialCellHeight * 0.7),
        aboveBreakPointCallback: () => setCellHeight(initialCellHeight),
    });

    // populate time lines
    const timeLineFreqMap: TimeLineFreqMap = useMemo(() => {
        const newTimeLineMap = getInitialTimeLineFreqMap();
        planner?.allTasks.forEach((task) => {
            const hour = task.dateTime.getHours();
            newTimeLineMap[hour] += 1;
        });
        return newTimeLineMap;
    }, [planner]);

    const getTopOffset = (hours: number, minutes: number = 0) => {
        const targetHours = hours || 24;
        if (planner == null) return '0rem';

        let topOffset = 0;
        for (let hour = 1; hour < targetHours; hour++) {
            if (!timeLineFreqMap[hour]) {
                topOffset += emptyCellHeight;
            } else {
                topOffset += cellHeight;
            }
        }

        let topOffsetAdjusted = topOffset;
        if (minutes > 0) {
            const additionalOffset = parseFloat(getCellHeight(hours));
            topOffsetAdjusted += additionalOffset * (minutes / 60);
        }
        return topOffsetAdjusted + 'rem';
    };

    const isCellEmpty = (hours: number) => {
        return !timeLineFreqMap[hours];
    };

    const getCellHeight = (hours: number): string => {
        if (!timeLineFreqMap[hours]) return emptyCellHeight + 'rem';
        return cellHeight + 'rem';
    };

    const getTaskHeight = (task: AbstractTask) => {
        const startHour = task.dateTime.getHours();
        const durationHours = Math.max(task.duration / 60, 1); // min height 1 regardless of duration
        const endTime = task.endTime;

        let taskHeight = 0;
        for (let hour = startHour; hour < startHour + durationHours; hour++) {
            if (isCellEmpty(hour)) {
                taskHeight += emptyCellHeight;
            } else {
                taskHeight += cellHeight;
            }
        }
        let taskAdjustedHeight = taskHeight - 0.35;
        if (endTime.getMinutes() >= 30) {
            const additionalCellHeight = parseFloat(getCellHeight(endTime.getHours())) / 2.0;
            taskAdjustedHeight += additionalCellHeight;
        }
        return taskAdjustedHeight + 'rem';
    };

    const getTotalTableHeight = (): string => {
        let height = 0;
        for (let hour = 0; hour < 24; hour++) {
            if (isCellEmpty(hour)) {
                height += emptyCellHeight;
            } else {
                height += cellHeight;
            }
        }
        return height + 'rem';
    };

    const value = {
        cellHeight,
        emptyCellHeight,
        minCellWidth,
        getTopOffset,
        getCellHeight,
        getTaskHeight,
        getTotalTableHeight,
    };

    return <TimeTableContext.Provider value={value}>{children}</TimeTableContext.Provider>;
};

import React, { useCallback, useEffect, useMemo, useState } from "react";

import useDateTime, { ResetPeriod } from "../../hooks/useDateTime";
import { PlannerTask, Task } from "../../models/task-models/Task";
import { Todo } from "../../models/todo-models/Todo";
import { Calendar } from "../../models/calendar-models/Calendar";
import { CalendarItem } from "../../models/calendar-models/CalendarItem";
import { getCurrentMonthBeginning } from "../../utilities/date-utils/date-get";
import { processTodos } from "../../utilities/todos-utils/todo-util";
import CalendarContainer from "./calendar-parts/CalendarContainer";
import CalendarControl from "./calendar-control/CalendarControl";
import { useAppSelector } from "../../store/redux";
import { adjustIfOverdueTask } from "../../utilities/tasks-utils/task-util";
import { Event } from "../../models/Event";
import { adjustIfOverdueEvent } from "../../utilities/event-utils/event-util";

interface Props {
    todos: Todo[];
    tasks: Task[];
    events: Event[];
    onInvalidateAll(): void;
}

// need to check overdue
function processTasks(tasks: Task[]): PlannerTask[] {
    const plannerTaskList: PlannerTask[] = [];
    for (const task of tasks) {
        const convertedTask = new PlannerTask(task);
        adjustIfOverdueTask(convertedTask);
        plannerTaskList.push(convertedTask);
    }
    return plannerTaskList;
}

function processEvents(events: Event[]) {
    const eventsList: Event[] = events.map((ev) => {
        ev.dateTime = new Date(ev.dateTime);
        adjustIfOverdueEvent(ev);
        return ev;
    });
    return eventsList;
}

function populateCalendar(beginningPeriod: Date, calendarItems: CalendarItem[]): Calendar {
    const newCalendar = new Calendar(beginningPeriod);
    for (const item of calendarItems) {
        newCalendar.addItem(item); // add item only when the item dateTime lies within the calendar range
    }
    return newCalendar;
}

const CalendarMain: React.FC<Props> = (props) => {
    const { todos: unprocessedTodos, tasks, events: unprocessedEvents, onInvalidateAll } = props;

    const currentMonthBeginning = getCurrentMonthBeginning();
    const [calendar, setCalendar] = useState<Calendar>(new Calendar(currentMonthBeginning));

    const todos = useMemo(() => processTodos(unprocessedTodos), [unprocessedTodos]);
    const events = useMemo(() => processEvents(unprocessedEvents), [unprocessedEvents]);
    const plannerTasks = useMemo(() => processTasks(tasks), [tasks]);

    const { showSidebar } = useAppSelector((state) => state.calendar);

    const {
        currentTimeStamp: beginningPeriod,
        setCurrentTimeStamp,
        addMonths: addLocalMonths,
    } = useDateTime(currentMonthBeginning, ResetPeriod.MONTH);

    useEffect(() => {
        const calendarItems: CalendarItem[] = [...plannerTasks, ...todos, ...events];
        const newCalendar = populateCalendar(beginningPeriod, calendarItems);
        setCalendar(newCalendar);
    }, [beginningPeriod, todos, plannerTasks, events]);

    // if (calendar) {
    //     console.log(
    //         `calendarStart: ${calendar.calendarStart.toDateString()}, calendarEnd: ${calendar.calendarEnd.toDateString()}`,
    //     );
    // }

    const monthNaviagtionHandler = useCallback(
        (direction: number) => {
            if (direction !== 1 && direction !== -1)
                throw new Error("Direction parameter is wrong!");
            addLocalMonths(direction);
        },
        [addLocalMonths],
    );

    // Needs testing to check if the calendar navigates to current month date correctly
    const navigateCurrentMonthHandler = () => {
        setCurrentTimeStamp(currentMonthBeginning);
    };

    return (
        <main className="py-6 pl-4 text-slate-600">
            <h1 className="text-xl md:text-2xl lg:text-4xl font-normal mb-6">Calendar</h1>
            <div className="container flex">
                {/* Container for calendar layout and calendar sidebar */}
                <CalendarContainer
                    calendar={calendar}
                    onChangeMonth={monthNaviagtionHandler}
                    onNavigateCurrentMonth={navigateCurrentMonthHandler}
                    onInvalidateItems={onInvalidateAll}
                />
                {/* Unfinished component */}
                {showSidebar && (
                    <CalendarControl
                        onInvalidate={onInvalidateAll}
                        beginningPeriod={beginningPeriod}
                    />
                )}
            </div>
        </main>
    );
};

export default CalendarMain;

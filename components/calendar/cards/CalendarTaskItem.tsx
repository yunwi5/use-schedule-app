import React, { useCallback, useState } from "react";

import { PlannerMode } from "../../../models/planner-models/PlannerMode";
import { TaskStatus } from "../../../models/task-models/Status";
import { PlannerTask } from "../../../models/task-models/Task";
import { getShortNameWithRest } from "../../../utilities/gen-utils/string-util";
import PlannerTaskEdit from "../../planners/planner-crud/PlannerTaskEdit";
import TaskDetail from "../../tasks/task-modal/task-detail/TaskDetail";
import CalendarItemCard from "./CalendarItemCard";

interface Props {
    task: PlannerTask;
    beginningPeriod: Date;
    onInvalidate: () => void;
}

function getTaskStyle(task: PlannerTask) {
    let bgClass = "bg-slate-200"; // style when the task is weekly task
    let textClass = "text-slate-700";
    let hoverBgClass = "hover:bg-slate-400";
    let hoverTextClass = "hover:text-slate-50";
    if (task.plannerType === PlannerMode.MONTLY) {
        bgClass = "bg-sky-100";
        textClass = "text-sky-700";
        hoverBgClass = "hover:bg-sky-400";
        hoverTextClass = "hover:text-sky-50";
    } else if (task.plannerType === PlannerMode.YEARLY) {
        bgClass = "bg-blue-100";
        textClass = "text-blue-700";
        hoverBgClass = "hover:bg-blue-400";
        hoverTextClass = "hover:text-blue-50";
    }
    return { bgClass, textClass, hoverBgClass, hoverTextClass };
}

const CalendarTaskItem: React.FC<Props> = ({ task, beginningPeriod, onInvalidate }) => {
    const { bgClass, textClass, hoverBgClass, hoverTextClass } = getTaskStyle(task);

    const [showDetail, setShowDetail] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);

    const editHandler = useCallback(() => {
        setShowEditForm(true);
        setShowDetail(false);
    }, []);
    const updateHandler = (updateTask?: PlannerTask) => {
        onInvalidate();
    };

    return (
        <>
            <CalendarItemCard
                bgClass={bgClass}
                textClass={textClass}
                hoverBgClass={hoverBgClass}
                hoverTextClass={hoverTextClass}
                isCompleted={task.status === TaskStatus.COMPLETED}
                dueDate={task.dueDate}
                onClick={setShowDetail.bind(null, true)}
            >
                {getShortNameWithRest(task.name, 10, 2)}
            </CalendarItemCard>
            {showDetail && (
                <TaskDetail
                    task={task}
                    onClose={setShowDetail.bind(null, false)}
                    onEdit={editHandler}
                />
            )}
            {showEditForm && (
                <PlannerTaskEdit
                    initialTask={task}
                    onClose={setShowEditForm.bind(null, false)}
                    beginningPeriod={beginningPeriod}
                    onUpdate={updateHandler}
                />
            )}
        </>
    );
};

export default CalendarTaskItem;

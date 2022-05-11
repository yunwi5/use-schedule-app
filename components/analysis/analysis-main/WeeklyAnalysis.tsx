import React, { useEffect } from 'react';

import useDateTime, { ResetPeriod } from '../../../hooks/useDateTime';
import { PlannerMode } from '../../../models/planner-models/PlannerMode';
import { Task } from '../../../models/task-models/Task';
import { useAppDispatch } from '../../../store/redux';
import { plannerActions } from '../../../store/redux/planner-slice';
import { getCurrentWeekBeginning } from '../../../utilities/date-utils/date-get';
import AnalysisMain from './AnalysisMain';

interface Props {
    allTasks: Task[];
    periodicTasks: Task[]; // Either weekly, montly or yearly tasks specific
    beginningDate: Date;
}

const WeeklyAnalysis: React.FC<Props> = (props) => {
    const { beginningDate } = props;

    const dispatch = useAppDispatch();
    const currentWeekBeginning = getCurrentWeekBeginning(); // current timestemp -> DateTime now.
    const {
        currentTimeStamp: currentPeriod,
        addWeeks: addLocalWeeks,
        setCurrentTimeStamp,
    } = useDateTime(beginningDate, ResetPeriod.WEEK);

    // If the week beginning changes, the planner also has to change to load new tasks according to
    // Changed week beginning.
    const weekNavigateHandler = (direction?: number) => {
        if (typeof direction !== 'number') {
            setCurrentTimeStamp(currentWeekBeginning);
            return;
        }
        if (direction !== 1 && direction !== -1) {
            console.error('Direction parameter is wrong!');
            return;
        }
        // Hook call
        addLocalWeeks(direction);
    };

    useEffect(() => {
        dispatch(plannerActions.setPlannerMode(PlannerMode.WEEKLY));
    }, [dispatch]);

    return (
        <AnalysisMain {...props} onNavigate={weekNavigateHandler} currentPeriod={currentPeriod} />
    );
};

export default WeeklyAnalysis;

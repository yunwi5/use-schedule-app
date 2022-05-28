import TableNav from '../planner-nav/TableNav';
import WeekdayList from './WeekdayList';
import { WeeklyPlanner } from '../../../models/planner-models/WeeklyPlanner';
import WeekdayTable from '../tables/WeekdayTable';

interface Props {
    weekBeginning: Date;
    planner: WeeklyPlanner;
    onChangeWeek: (direction: number) => void;
    onNavigateCurrentPeriod(): void;
    onMutate: () => void;
}

const WeeklyTable: React.FC<Props> = (props) => {
    const { weekBeginning, planner, onChangeWeek, onNavigateCurrentPeriod, onMutate } = props;

    return (
        <div>
            <TableNav
                beginningPeriod={weekBeginning}
                planner={planner}
                onChangePeriod={onChangeWeek}
                onNavigateCurrentPeriod={onNavigateCurrentPeriod}
            />
            {/* <WeekdayList beginningPeriod={weekBeginning} planner={planner} onMutate={onMutate} /> */}
            <WeekdayTable beginningPeriod={weekBeginning} planner={planner} onMutate={onMutate} />
        </div>
    );
};

export default WeeklyTable;

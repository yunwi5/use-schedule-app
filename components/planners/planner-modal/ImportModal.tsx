import React, { useCallback, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation } from '@fortawesome/pro-duotone-svg-icons';
import { faCheck, faXmark } from '@fortawesome/pro-regular-svg-icons';
import { css } from '@emotion/react';

import useNotification from '../../../hooks/useNotification';
import { NotifStatus } from '../../ui/Notification';
import { useAppSelector } from '../../../store/redux';
import { getFullDateFormat } from '../../../utilities/date-utils/date-format';
import { Template } from '../../../models/template-models/Template';
import { transferTemplateToWeekly } from '../../../lib/templates/templates-api';
import { Theme } from '../../../models/design-models';
import Button from '../../ui/buttons/Button';
import Modal from '../../ui/modal/Modal';
import classes from './ImportModal.module.scss';

interface Props {
    onClose(): void;
    beginningPeriod: Date;
    onMutate: () => void;
}

const override = css`
    display: block;
    margin: 0 auto;
    width: 120px;
    height: 120px;
    border-color: red;
`;

const ImportModal: React.FC<Props> = ({ onClose, beginningPeriod, onMutate }) => {
    const [selectedTemps, setSelectedTemps] = useState<Template[]>([]);
    const templates = useAppSelector((state) => state.template.templates);

    const { setNotification } = useNotification();

    const importHandler = async () => {
        if (!beginningPeriod || !selectedTemps.length) return;

        setNotification(NotifStatus.PENDING, 'Transferring template tasks...');
        const importPromises: Promise<{ isSuccess: boolean; data: any }>[] = selectedTemps.map(
            (template) => transferTemplateToWeekly(template.id, new Date(beginningPeriod)),
        );
        const importResults = await Promise.all(importPromises);
        const successCounts = importResults.reduce(
            (acc, res) => (res.isSuccess ? acc + 1 : acc),
            0,
        );
        if (successCounts > 0) {
            setNotification(NotifStatus.SUCCESS, `Importing ${successCounts} tables successful!`);
            onMutate();
            onClose();
        } else {
            setNotification(NotifStatus.ERROR);
        }
    };

    const selectHandler = useCallback(
        (temp: Template) => {
            if (selectedTemps.includes(temp)) {
                setSelectedTemps(selectedTemps.filter((t) => t.id !== temp.id));
            } else {
                setSelectedTemps([...selectedTemps, temp]);
            }
        },
        [selectedTemps],
    );

    const clearHandler = useCallback(() => setSelectedTemps([]), []);

    const checkIfSelected = (template: Template) => selectedTemps.includes(template);

    return (
        <Modal onClose={onClose} modalClass={`${classes.modal}`}>
            <FontAwesomeIcon
                icon={faXmark}
                className={`${classes.icon} ${classes.exit}`}
                onClick={onClose}
            />
            <h2 className={classes.heading}>Select table(s) to import</h2>
            <div className={classes.container}>
                {templates.length === 0 && <h2>You have no time tables yet!</h2>}
                {templates.map((temp) => (
                    <div
                        key={temp.id}
                        className={`${classes.template} ${
                            checkIfSelected(temp) ? classes.selected : ''
                        }`}
                        onClick={selectHandler.bind(null, temp)}
                    >
                        <p className={classes.text}>{temp.name}</p>
                        {checkIfSelected(temp) && (
                            <FontAwesomeIcon icon={faCheck} className={classes.icon} />
                        )}
                    </div>
                ))}
            </div>
            {selectedTemps.length > 0 && (
                <p className={classes.message}>
                    <FontAwesomeIcon icon={faCircleExclamation} className={classes.info} />
                    All tasks & sub tasks of your template{selectedTemps.length > 1 ? 's ' : ' '}
                    {selectedTemps.map((temp, idx) => (
                        <span key={temp.id}>
                            <span className={'!font-medium'}>
                                {idx === selectedTemps.length - 1 ? 'and ' : ' '}
                            </span>
                            &quot;{temp.name}&quot;
                            {idx < selectedTemps.length - 2 ? ', ' : ' '}
                        </span>
                    ))}
                    will be imported to the week beginning at &nbsp;
                    <time>{getFullDateFormat(beginningPeriod)}</time>.
                </p>
            )}
            {/* <ClipLoader color="#000000" loading={true} css={override} size={150} /> */}
            <div className={classes.control}>
                <Button theme={Theme.WARNING} className={classes.btn} onClick={clearHandler}>
                    Clear
                </Button>
                <Button theme={Theme.TERTIARY} className={classes.btn} onClick={importHandler}>
                    Import
                </Button>
            </div>
        </Modal>
    );
};

export default ImportModal;

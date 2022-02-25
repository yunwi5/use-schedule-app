export enum Month {
	JANUARY = "January",
	FEBRUARY = "February",
	MARCH = "March",
	APRIL = "April",
	MAY = "May",
	JUNE = "June",
	JULY = "July",
	AUGUST = "August",
	SEPTEMBER = "September",
	OCTOBER = "October",
	NOVEMBER = "November",
	DECEMBER = "December",
	ANY = "Any"
}

export const MonthListFromJan = [
	Month.JANUARY,
	Month.FEBRUARY,
	Month.MARCH,
	Month.APRIL,
	Month.MAY,
	Month.JUNE,
	Month.JULY,
	Month.AUGUST,
	Month.SEPTEMBER,
	Month.OCTOBER,
	Month.NOVEMBER,
	Month.DECEMBER,
	Month.ANY
];

export function getMonthFromIndex (index: number) {
	if (index < MonthListFromJan.length) return MonthListFromJan[index];
	return Month.ANY;
}

// Needs testing
export function getMonthMember (date: Date | null) {
	if (!date) return Month.ANY;

	const monthNumber = date.getMonth();
	return MonthListFromJan[monthNumber];
}

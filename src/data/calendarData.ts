export type EventCategory =
  | "holiday"
  | "sports"
  | "academic"
  | "cultural"
  | "club"
  | "exam"
  | "general";

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  category: EventCategory;
  description?: string;
  isCustom?: boolean;
}

export const CALENDAR_START = "2026-10-01";
export const ACADEMIC_YEAR_START = "2027-03-01";
export const CALENDAR_END = "2028-05-31";
export const CALENDAR_VERSION = "2027-28-v1";

export const categoryLabels: Record<EventCategory, string> = {
  holiday: "Holiday",
  sports: "Sports",
  academic: "Academic",
  cultural: "Cultural",
  club: "Club Activity",
  exam: "Examination",
  general: "General",
};

export const categoryIcons: Record<EventCategory, string> = {
  holiday: "🏖️",
  sports: "🏅",
  academic: "📚",
  cultural: "🎭",
  club: "🎨",
  exam: "📝",
  general: "📌",
};

let nextId = 1000;
export const generateId = () => `evt-${Date.now()}-${nextId++}`;

type EventSeed = Omit<CalendarEvent, "id">;
const e = (date: string, title: string, category: EventCategory, description?: string): EventSeed => ({ date, title, category, description });
const tentative = "Tentative date; confirm with the applicable government/state circular or local moon-sighting announcement.";
const regional = "Regional observance; schools should customize this according to their state and local holiday list.";
const schoolPlanned = "Suggested planning date; edit it to match your school's timetable.";

const eventSeeds: EventSeed[] = [
  // Preparation months: October 2026–February 2027
  e("2026-10-01", "Calendar Preparation Window Opens", "academic", "Begin annual calendar consultation with school leaders, teachers, parents and student representatives."),
  e("2026-10-02", "Gandhi Jayanti & International Day of Non-Violence", "holiday", "National holiday; peace assembly, cleanliness drive and values-based activities."),
  e("2026-10-05", "World Teachers' Day", "cultural", "Teacher appreciation and professional-learning reflection."),
  e("2026-10-08", "Indian Air Force Day", "cultural", "Aerospace careers talk and aeromodelling showcase."),
  e("2026-10-10", "World Mental Health Day", "general", "Student wellbeing circles and peer-support awareness."),
  e("2026-10-11", "International Day of the Girl Child", "cultural", "Girls-in-STEM panel and gender equity activities."),
  e("2026-10-13", "International Day for Disaster Risk Reduction", "general", "Emergency drill and campus safety audit."),
  e("2026-10-15", "World Students' Day / A.P.J. Abdul Kalam Jayanti", "academic", "Innovation challenge and inspirational reading."),
  e("2026-10-16", "World Food Day", "club", "Nutrition workshop and no-food-waste campaign."),
  e("2026-10-20", "Dussehra / Vijayadashami", "holiday", "Gazetted holiday for 2026."),
  e("2026-10-24", "United Nations Day", "academic", "Mini Model United Nations and global citizenship projects."),
  e("2026-10-31", "National Unity Day", "cultural", "Unity pledge and Run for Unity."),

  e("2026-11-07", "National Cancer Awareness Day", "general", "Age-appropriate health awareness programme."),
  e("2026-11-08", "Diwali / Deepavali", "holiday", "Gazetted holiday for 2026; encourage safe, green celebrations."),
  e("2026-11-09", "School Reopens / Post-Diwali Reflection", "general", schoolPlanned),
  e("2026-11-11", "National Education Day", "academic", "Learning festival commemorating Maulana Abul Kalam Azad."),
  e("2026-11-14", "Children's Day", "cultural", "Student celebration, games and teacher-led performances."),
  e("2026-11-16", "International Day for Tolerance", "general", "Anti-bullying and intercultural understanding workshop."),
  e("2026-11-19", "World Toilet Day", "club", "WASH and hygiene campaign led by the health club."),
  e("2026-11-20", "World Children's Day", "academic", "Child rights quiz and student voice forum."),
  e("2026-11-24", "Guru Nanak Jayanti", "holiday", "Gazetted holiday for 2026."),
  e("2026-11-26", "Constitution Day / Samvidhan Divas", "cultural", "Preamble reading, mock Parliament and civic duties."),
  e("2026-11-28", "Annual Sports Meet Planning Conference", "sports", schoolPlanned),

  e("2026-12-01", "World AIDS Day", "general", "Age-appropriate health and empathy awareness."),
  e("2026-12-03", "International Day of Persons with Disabilities", "general", "Inclusive sports and accessibility audit."),
  e("2026-12-04", "Indian Navy Day", "cultural", "Maritime history and careers assembly."),
  e("2026-12-05", "World Soil Day", "club", "Composting and school garden activity."),
  e("2026-12-10", "Human Rights Day", "academic", "Human rights charter and classroom discussions."),
  e("2026-12-14", "National Energy Conservation Day", "club", "Student-led school energy audit."),
  e("2026-12-16", "Vijay Diwas", "cultural", "Tribute assembly."),
  e("2026-12-18", "Pre-Board Examination Review", "exam", schoolPlanned),
  e("2026-12-22", "National Mathematics Day", "academic", "Ramanujan math carnival, puzzles and Olympiad."),
  e("2026-12-23", "Winter Reading Challenge Begins", "club", schoolPlanned),
  e("2026-12-25", "Christmas Day", "holiday", "National gazetted holiday."),

  e("2027-01-04", "World Braille Day", "general", "Braille literacy station and inclusive reading."),
  e("2027-01-06", "School Reopens & Staff Planning Day", "general", schoolPlanned),
  e("2027-01-12", "National Youth Day", "cultural", "Leadership workshop on Swami Vivekananda's ideals."),
  e("2027-01-14", "Makar Sankranti / Pongal / Magh Bihu", "holiday", regional),
  e("2027-01-15", "Army Day", "cultural", "NCC and armed forces appreciation assembly."),
  e("2027-01-18", "Inter-House Athletics Trials", "sports", schoolPlanned),
  e("2027-01-23", "Parakram Diwas", "cultural", "Netaji Subhas Chandra Bose remembrance."),
  e("2027-01-24", "National Girl Child Day", "general", "Mentoring and equal-opportunity programme."),
  e("2027-01-25", "National Voters' Day", "academic", "Mock election and civics quiz."),
  e("2027-01-26", "Republic Day", "holiday", "National holiday; flag hoisting and cultural programme."),
  e("2027-01-29", "Annual Sports Day", "sports", schoolPlanned),

  e("2027-02-01", "Annual Examination Timetable Release", "exam", schoolPlanned),
  e("2027-02-04", "World Cancer Day", "general", "Health awareness and healthy habits campaign."),
  e("2027-02-08", "Board Practical Examinations Begin", "exam", schoolPlanned),
  e("2027-02-11", "International Day of Women and Girls in Science", "academic", "Girls-in-STEM fair and scientist spotlight."),
  e("2027-02-13", "World Radio Day", "club", "Student podcast and campus radio activity."),
  e("2027-02-19", "Chhatrapati Shivaji Maharaj Jayanti", "cultural", regional),
  e("2027-02-21", "International Mother Language Day", "cultural", "Multilingual poetry, storytelling and regional-language showcase."),
  e("2027-02-24", "Farewell for Classes X & XII", "cultural", schoolPlanned),
  e("2027-02-28", "National Science Day", "academic", "C.V. Raman science exhibition and experiment fair."),

  // Main academic calendar: March 2027–May 2028
  e("2027-03-01", "Zero Discrimination Day", "general", "Inclusion pledge and respect campaign."),
  e("2027-03-03", "World Wildlife Day", "club", "Biodiversity project and wildlife conservation quiz."),
  e("2027-03-06", "Maha Shivaratri", "holiday", regional),
  e("2027-03-08", "International Women's Day", "cultural", "Women achievers exhibition and student panel."),
  e("2027-03-10", "Eid-ul-Fitr", "holiday", tentative),
  e("2027-03-12", "Annual Examinations Begin", "exam", schoolPlanned),
  e("2027-03-15", "World Consumer Rights Day", "academic", "Consumer awareness and financial literacy activity."),
  e("2027-03-20", "International Day of Happiness & World Sparrow Day", "club", "Wellbeing activities and birdhouse-making."),
  e("2027-03-21", "International Day of Forests", "club", "Tree census and campus greening plan."),
  e("2027-03-22", "Holi", "holiday", "Gazetted holiday for 2027."),
  e("2027-03-22", "World Water Day", "club", "Water audit and rainwater-harvesting demonstration."),
  e("2027-03-23", "World Meteorological Day", "academic", "Student weather station project."),
  e("2027-03-26", "Good Friday", "holiday", "Gazetted holiday for 2027."),
  e("2027-03-28", "Easter Sunday", "holiday", regional),
  e("2027-03-30", "Annual Results & Parent-Teacher Meeting", "academic", schoolPlanned),
  e("2027-03-31", "Academic Session Closure", "general", schoolPlanned),

  e("2027-04-01", "New Academic Session Begins", "general", "Welcome assembly, goal setting and class induction."),
  e("2027-04-02", "World Autism Awareness Day", "general", "Neurodiversity and inclusive-classroom awareness."),
  e("2027-04-05", "Parent & New Student Orientation", "academic", schoolPlanned),
  e("2027-04-07", "World Health Day", "general", "Health screening and fitness challenge."),
  e("2027-04-07", "Ugadi / Gudi Padwa / Cheti Chand", "holiday", regional),
  e("2027-04-10", "Student Council Nominations", "academic", schoolPlanned),
  e("2027-04-14", "Vaisakhi / Vishu / Tamil & Bengali New Year", "holiday", regional),
  e("2027-04-14", "Dr. B.R. Ambedkar Jayanti", "holiday", "Social justice and Constitution remembrance."),
  e("2027-04-15", "Ram Navami", "holiday", "Gazetted holiday for 2027."),
  e("2027-04-17", "Inter-House Debate & Elocution", "club", schoolPlanned),
  e("2027-04-19", "Mahavir Jayanti", "holiday", "Gazetted holiday for 2027."),
  e("2027-04-22", "International Mother Earth Day", "club", "Eco fair, clean-up and recycling challenge."),
  e("2027-04-23", "World Book and Copyright Day", "academic", "Book swap, author talk and reading marathon."),
  e("2027-04-26", "School Council Elections", "academic", schoolPlanned),
  e("2027-04-29", "International Dance Day", "cultural", "Indian and world dance showcase."),

  e("2027-05-01", "Labour Day", "holiday", "Appreciation programme for school support staff."),
  e("2027-05-03", "World Press Freedom Day", "club", "School newspaper and media literacy workshop."),
  e("2027-05-05", "Inter-House Cricket League Begins", "sports", schoolPlanned),
  e("2027-05-08", "World Red Cross Day", "general", "First-aid workshop and service learning."),
  e("2027-05-11", "National Technology Day", "academic", "Innovation expo, coding and robotics challenge."),
  e("2027-05-15", "International Day of Families", "cultural", "Family heritage and oral-history projects."),
  e("2027-05-17", "Eid-ul-Adha / Bakrid", "holiday", tentative),
  e("2027-05-17", "World Telecommunication and Information Society Day", "academic", "Cyber safety and digital citizenship."),
  e("2027-05-20", "Buddha Purnima", "holiday", "Gazetted holiday for 2027."),
  e("2027-05-21", "National Anti-Terrorism Day", "cultural", "Peace pledge and responsible citizenship."),
  e("2027-05-22", "International Day for Biological Diversity", "club", "Campus biodiversity mapping and nature trail."),
  e("2027-05-24", "Summer Vacation & Reading Programme Begins", "holiday", schoolPlanned),

  e("2027-06-05", "World Environment Day", "club", "Flagship tree plantation and plastic-free campus campaign."),
  e("2027-06-08", "World Oceans Day", "club", "Marine conservation art and awareness."),
  e("2027-06-12", "World Day Against Child Labour", "general", "Child rights awareness."),
  e("2027-06-16", "Muharram", "holiday", tentative),
  e("2027-06-18", "School Reopens after Summer Break", "general", schoolPlanned),
  e("2027-06-20", "World Refugee Day", "general", "Empathy and global citizenship stories."),
  e("2027-06-21", "International Day of Yoga", "sports", "Mass yoga session and wellbeing week."),
  e("2027-06-23", "Inter-House Football Tournament", "sports", schoolPlanned),
  e("2027-06-26", "International Day Against Drug Abuse", "general", "Age-appropriate prevention and healthy choices session."),
  e("2027-06-28", "Unit Assessment 1 Begins", "exam", schoolPlanned),

  e("2027-07-01", "National Doctors' Day", "general", "Health careers talk and gratitude cards."),
  e("2027-07-01", "Van Mahotsav Week Begins", "club", "Native tree plantation and stewardship."),
  e("2027-07-11", "World Population Day", "academic", "Demography and sustainable development project."),
  e("2027-07-15", "World Youth Skills Day", "academic", "Maker workshops and vocational skill stations."),
  e("2027-07-18", "Nelson Mandela International Day", "general", "Community service challenge."),
  e("2027-07-20", "Inter-House Badminton Championship", "sports", schoolPlanned),
  e("2027-07-23", "Robotics Club Bot Challenge", "club", schoolPlanned),
  e("2027-07-26", "Kargil Vijay Diwas", "cultural", "Courage and service tribute assembly."),
  e("2027-07-29", "International Tiger Day", "club", "Tiger conservation campaign."),
  e("2027-07-30", "International Day of Friendship", "cultural", "Peer mentoring and friendship activities."),

  e("2027-08-06", "Hiroshima Day", "cultural", "Peace education and origami crane project."),
  e("2027-08-09", "International Day of the World's Indigenous Peoples", "cultural", "Indian tribal heritage showcase."),
  e("2027-08-12", "International Youth Day", "general", "Student leadership summit."),
  e("2027-08-14", "Independence Day Cultural Programme", "cultural", schoolPlanned),
  e("2027-08-15", "Independence Day", "holiday", "National holiday; flag hoisting and patriotic programme."),
  e("2027-08-15", "Milad-un-Nabi", "holiday", tentative),
  e("2027-08-19", "World Photography & Humanitarian Day", "club", "Photo exhibition on service and community."),
  e("2027-08-20", "Sadbhavana Diwas", "cultural", "Harmony and goodwill pledge."),
  e("2027-08-25", "Janmashtami", "holiday", "Gazetted holiday for 2027."),
  e("2027-08-27", "Inter-House Volleyball Tournament", "sports", schoolPlanned),
  e("2027-08-29", "National Sports Day", "sports", "Fitness challenge and tribute to Major Dhyan Chand."),

  e("2027-09-05", "Teachers' Day", "cultural", "Student-led appreciation programme."),
  e("2027-09-08", "International Literacy Day", "academic", "Reading marathon and buddy reading."),
  e("2027-09-14", "Hindi Diwas", "cultural", "Hindi debate, poetry and creative writing."),
  e("2027-09-15", "Engineers' Day & International Day of Democracy", "academic", "Design challenge and student parliament."),
  e("2027-09-16", "World Ozone Day", "club", "Climate science and ozone protection project."),
  e("2027-09-18", "First-Term Examinations Begin", "exam", schoolPlanned),
  e("2027-09-21", "International Day of Peace", "cultural", "Peace assembly and mediation activities."),
  e("2027-09-23", "International Day of Sign Languages", "general", "Basic Indian Sign Language workshop."),
  e("2027-09-27", "World Tourism Day", "club", "Incredible India heritage showcase."),
  e("2027-09-30", "First-Term Examinations End", "exam", schoolPlanned),

  e("2027-10-01", "International Day of Older Persons", "general", "Intergenerational learning and grandparents' stories."),
  e("2027-10-02", "Gandhi Jayanti & International Day of Non-Violence", "holiday", "National holiday; peace and cleanliness activities."),
  e("2027-10-05", "World Teachers' Day", "academic", "Professional learning and teaching innovation showcase."),
  e("2027-10-08", "Indian Air Force Day", "cultural", "Aerospace and defence careers session."),
  e("2027-10-09", "Dussehra / Vijayadashami", "holiday", "Gazetted holiday for 2027."),
  e("2027-10-10", "World Mental Health Day", "general", "Wellbeing fair and counselling awareness."),
  e("2027-10-11", "International Day of the Girl Child", "general", "Leadership and equality programme."),
  e("2027-10-13", "International Day for Disaster Risk Reduction", "general", "School emergency drill."),
  e("2027-10-16", "World Food Day", "club", "Nutrition, kitchen garden and zero-waste activity."),
  e("2027-10-24", "United Nations Day", "academic", "Model UN and global goals exhibition."),
  e("2027-10-29", "Diwali / Deepavali", "holiday", "Gazetted holiday for 2027."),
  e("2027-10-31", "National Unity Day", "cultural", "Unity pledge and run."),

  e("2027-11-07", "National Cancer Awareness Day", "general", "Health awareness session."),
  e("2027-11-11", "National Education Day", "academic", "Learning innovation fair."),
  e("2027-11-14", "Children's Day & Guru Nanak Jayanti", "holiday", "Guru Nanak Jayanti is gazetted; Children's Day programme may be observed on the preceding school day."),
  e("2027-11-16", "International Day for Tolerance", "general", "Inclusion and anti-bullying workshop."),
  e("2027-11-19", "World Toilet Day", "club", "WASH and hygiene audit."),
  e("2027-11-20", "World Children's Day", "academic", "Child rights and student voice forum."),
  e("2027-11-22", "Inter-House Athletics Meet", "sports", schoolPlanned),
  e("2027-11-26", "Constitution Day / Samvidhan Divas", "cultural", "Preamble reading and mock Parliament."),
  e("2027-11-29", "Annual Day Rehearsals Begin", "cultural", schoolPlanned),

  e("2027-12-01", "World AIDS Day", "general", "Age-appropriate health awareness."),
  e("2027-12-03", "International Day of Persons with Disabilities", "general", "Inclusion fair and accessible sports."),
  e("2027-12-04", "Indian Navy Day", "cultural", "Maritime heritage assembly."),
  e("2027-12-05", "World Soil Day", "club", "Soil testing and compost activity."),
  e("2027-12-10", "Human Rights Day", "academic", "Rights and duties student tribunal."),
  e("2027-12-11", "International Mountain Day", "club", "Himalayan ecology project."),
  e("2027-12-14", "National Energy Conservation Day", "club", "Campus energy-saving competition."),
  e("2027-12-16", "Vijay Diwas", "cultural", "Service and courage tribute."),
  e("2027-12-18", "Pre-Board Examinations Begin", "exam", schoolPlanned),
  e("2027-12-22", "National Mathematics Day", "academic", "Ramanujan math and puzzle carnival."),
  e("2027-12-23", "Christmas Celebration & Winter Break Begins", "cultural", schoolPlanned),
  e("2027-12-25", "Christmas Day", "holiday", "National gazetted holiday."),

  e("2028-01-04", "World Braille Day", "general", "Inclusive literacy stations."),
  e("2028-01-06", "School Reopens & Goal-Setting Day", "general", schoolPlanned),
  e("2028-01-12", "National Youth Day", "cultural", "Youth leadership and service programme."),
  e("2028-01-14", "Makar Sankranti / Pongal / Magh Bihu", "holiday", regional),
  e("2028-01-15", "Army Day", "cultural", "NCC and armed forces appreciation."),
  e("2028-01-18", "Annual Sports Day", "sports", schoolPlanned),
  e("2028-01-23", "Parakram Diwas", "cultural", "Netaji remembrance assembly."),
  e("2028-01-24", "National Girl Child Day", "general", "Mentoring and equal opportunity programme."),
  e("2028-01-25", "National Voters' Day", "academic", "Mock election and civic participation."),
  e("2028-01-26", "Republic Day", "holiday", "National holiday; flag hoisting and cultural programme."),
  e("2028-01-29", "Inter-School Sports Invitational", "sports", schoolPlanned),

  e("2028-02-04", "World Cancer Day", "general", "Health and prevention awareness."),
  e("2028-02-07", "Board Practical Examinations Begin", "exam", schoolPlanned),
  e("2028-02-11", "International Day of Women and Girls in Science", "academic", "Women scientist showcase and STEM challenge."),
  e("2028-02-13", "World Radio Day", "club", "Student podcast festival."),
  e("2028-02-19", "Chhatrapati Shivaji Maharaj Jayanti", "cultural", regional),
  e("2028-02-21", "International Mother Language Day", "cultural", "Multilingual literary festival."),
  e("2028-02-23", "Maha Shivaratri", "holiday", `${tentative} ${regional}`),
  e("2028-02-25", "Farewell for Classes X & XII", "cultural", schoolPlanned),
  e("2028-02-27", "Eid-ul-Fitr", "holiday", tentative),
  e("2028-02-28", "National Science Day", "academic", "Science exposition and C.V. Raman tribute."),
  e("2028-02-29", "Leap Day STEM Challenge", "club", "Explore calendars, astronomy, timekeeping and leap-year mathematics."),

  e("2028-03-01", "Zero Discrimination Day", "general", "Inclusion and belonging pledge."),
  e("2028-03-03", "World Wildlife Day", "club", "Conservation campaign."),
  e("2028-03-06", "Annual Examinations Begin", "exam", schoolPlanned),
  e("2028-03-08", "International Women's Day", "cultural", "Women achievers programme."),
  e("2028-03-11", "Holi", "holiday", "Projected festival date; verify against the official 2028 holiday list."),
  e("2028-03-15", "World Consumer Rights Day", "academic", "Consumer and financial literacy."),
  e("2028-03-20", "International Day of Happiness & World Sparrow Day", "club", "Wellbeing and urban biodiversity activities."),
  e("2028-03-21", "International Day of Forests", "club", "Campus tree census."),
  e("2028-03-22", "World Water Day", "club", "Water conservation audit."),
  e("2028-03-23", "World Meteorological Day", "academic", "Climate and weather project."),
  e("2028-03-27", "Ugadi / Gudi Padwa", "holiday", `${tentative} ${regional}`),
  e("2028-03-29", "Annual Results & Parent-Teacher Meeting", "academic", schoolPlanned),
  e("2028-03-31", "Academic Session Closure", "general", schoolPlanned),

  e("2028-04-01", "New Academic Session 2028–29 Begins", "general", schoolPlanned),
  e("2028-04-02", "World Autism Awareness Day", "general", "Neurodiversity and inclusion activities."),
  e("2028-04-03", "Ram Navami", "holiday", tentative),
  e("2028-04-05", "Parent & New Student Orientation", "academic", schoolPlanned),
  e("2028-04-07", "World Health Day", "general", "Health screening and fitness programme."),
  e("2028-04-10", "Student Council Nominations", "academic", schoolPlanned),
  e("2028-04-14", "Good Friday & Dr. B.R. Ambedkar Jayanti", "holiday", "National observances coincide in 2028; verify official state instructions."),
  e("2028-04-18", "Inter-House Debate & Elocution", "club", schoolPlanned),
  e("2028-04-22", "International Mother Earth Day", "club", "Eco fair and recycling challenge."),
  e("2028-04-23", "World Book and Copyright Day", "academic", "Book swap and reading marathon."),
  e("2028-04-25", "School Council Elections", "academic", schoolPlanned),
  e("2028-04-29", "International Dance Day", "cultural", "Classical, folk and contemporary dance festival."),

  e("2028-05-01", "Labour Day", "holiday", "Appreciation programme for school support staff."),
  e("2028-05-03", "World Press Freedom Day", "club", "Journalism and media literacy workshop."),
  e("2028-05-06", "Eid-ul-Adha / Bakrid", "holiday", tentative),
  e("2028-05-08", "Buddha Purnima", "holiday", tentative),
  e("2028-05-08", "World Red Cross Day", "general", "First-aid and humanitarian service programme."),
  e("2028-05-11", "National Technology Day", "academic", "Robotics, coding and innovation expo."),
  e("2028-05-15", "International Day of Families", "cultural", "Family heritage and oral-history project."),
  e("2028-05-17", "World Telecommunication and Information Society Day", "academic", "Digital citizenship and cyber-safety workshop."),
  e("2028-05-20", "Inter-House Cricket Finals", "sports", schoolPlanned),
  e("2028-05-21", "National Anti-Terrorism Day", "cultural", "Peace and unity pledge."),
  e("2028-05-22", "International Day for Biological Diversity", "club", "Biodiversity mapping and nature trail."),
  e("2028-05-24", "Summer Vacation & Reading Programme Begins", "holiday", schoolPlanned),
  e("2028-05-31", "Calendar Review & Next-Year Planning", "academic", "School leadership review of programmes, outcomes and next-year priorities."),
];

export const defaultEvents: CalendarEvent[] = eventSeeds.map((event, index) => ({
  ...event,
  id: `base-${String(index + 1).padStart(3, "0")}`,
}));

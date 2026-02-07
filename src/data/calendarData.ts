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
  date: string; // YYYY-MM-DD
  title: string;
  category: EventCategory;
  description?: string;
  isCustom?: boolean;
}

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
export const generateId = () => `evt-${nextId++}`;

// Comprehensive school calendar data for India (March 2026 – March 2027)
export const defaultEvents: CalendarEvent[] = [
  // ===== MARCH 2026 =====
  { id: "m1", date: "2026-03-04", title: "Summer Fest (Pre-Primary)", category: "cultural", description: "Fun activities and performances by pre-primary students" },
  { id: "m2", date: "2026-03-09", title: "Final Exams Begin (VI–IX)", category: "exam", description: "Annual examinations for classes VI to IX" },
  { id: "m3", date: "2026-03-13", title: "Pre-Primary Final Exams Begin", category: "exam" },
  { id: "m4", date: "2026-03-18", title: "Final Exams End", category: "exam" },
  { id: "m5", date: "2026-03-19", title: "Gudi Padwa", category: "holiday", description: "Maharashtrian New Year" },
  { id: "m6", date: "2026-03-20", title: "Ramzan Eid (Eid ul-Fitr)", category: "holiday", description: "End of Ramadan — School Holiday" },
  { id: "m7", date: "2026-03-26", title: "Ram Navami", category: "holiday", description: "Birth of Lord Rama — School Holiday" },
  { id: "m8", date: "2026-03-27", title: "Annual PTM (Nur–IX)", category: "academic", description: "Parent-Teacher Meeting for results and feedback" },
  { id: "m9", date: "2026-03-28", title: "Summer Vacation Begins", category: "holiday", description: "Summer break starts for all students" },

  // ===== APRIL 2026 =====
  { id: "a1", date: "2026-04-01", title: "School Re-opens – Special Assembly", category: "general", description: "New academic session begins with a special welcome assembly" },
  { id: "a2", date: "2026-04-02", title: "House Allotment (New Students)", category: "general", description: "New students are allotted to school houses" },
  { id: "a3", date: "2026-04-03", title: "School Council Formation", category: "academic", description: "Student council elections and formation" },
  { id: "a4", date: "2026-04-06", title: "Orientation Day (Parents)", category: "academic", description: "Orientation program for parents of new students" },
  { id: "a5", date: "2026-04-10", title: "Inter-House Debate Competition", category: "club", description: "Topic: 'Technology in Education — Boon or Bane'" },
  { id: "a6", date: "2026-04-14", title: "Dr. Ambedkar Jayanti", category: "holiday", description: "Birth anniversary of Dr. B.R. Ambedkar — School Holiday" },
  { id: "a7", date: "2026-04-17", title: "Earth Day Poster Making", category: "club", description: "Art club activity — posters on environmental awareness" },
  { id: "a8", date: "2026-04-18", title: "Intra-School Cricket Tournament Begins", category: "sports", description: "Inter-house cricket matches for classes VI–XII" },
  { id: "a9", date: "2026-04-22", title: "Earth Day Celebration", category: "cultural", description: "Tree plantation drive and eco-awareness assembly" },
  { id: "a10", date: "2026-04-25", title: "Cricket Tournament Finals", category: "sports" },
  { id: "a11", date: "2026-04-27", title: "World Book Day – Reading Marathon", category: "club", description: "Literary club hosts school-wide reading event" },
  { id: "a12", date: "2026-04-29", title: "English Elocution Competition", category: "club", description: "Individual elocution for classes III–V and VI–VIII" },

  // ===== MAY 2026 =====
  { id: "my1", date: "2026-05-01", title: "May Day / Labour Day", category: "holiday", description: "International Workers' Day" },
  { id: "my2", date: "2026-05-04", title: "Science Quiz Competition", category: "academic", description: "Inter-house science quiz for classes VI–X" },
  { id: "my3", date: "2026-05-07", title: "Buddha Purnima", category: "holiday", description: "Birth anniversary of Gautama Buddha — School Holiday" },
  { id: "my4", date: "2026-05-08", title: "Hindi Poetry Recitation", category: "club", description: "Hindi literary club activity" },
  { id: "my5", date: "2026-05-11", title: "Intra-School Basketball Tournament", category: "sports", description: "Inter-house basketball for juniors and seniors" },
  { id: "my6", date: "2026-05-14", title: "Mathematics Olympiad (School Level)", category: "academic", description: "School-level math olympiad for classes V–X" },
  { id: "my7", date: "2026-05-16", title: "Basketball Finals", category: "sports" },
  { id: "my8", date: "2026-05-18", title: "Art & Craft Exhibition", category: "cultural", description: "Display of student artwork and craft projects" },
  { id: "my9", date: "2026-05-20", title: "Spell Bee Competition", category: "club", description: "School-level spelling bee for classes III–VIII" },
  { id: "my10", date: "2026-05-22", title: "Summer Vacation Begins", category: "holiday", description: "Summer break for all students" },

  // ===== JUNE 2026 =====
  { id: "j1", date: "2026-06-15", title: "School Re-opens after Summer Break", category: "general", description: "Classes resume for all students" },
  { id: "j2", date: "2026-06-16", title: "Yoga Week Begins", category: "sports", description: "Week-long yoga and fitness activities" },
  { id: "j3", date: "2026-06-19", title: "World Yoga Day Celebration", category: "sports", description: "Mass yoga session and awareness program" },
  { id: "j4", date: "2026-06-21", title: "International Yoga Day", category: "cultural", description: "School-wide yoga celebration" },
  { id: "j5", date: "2026-06-22", title: "Yoga Week Ends / Awards", category: "sports" },
  { id: "j6", date: "2026-06-24", title: "Inter-House Football Tournament Begins", category: "sports", description: "Football matches for classes VI–XII" },
  { id: "j7", date: "2026-06-25", title: "Science Club — Rocket Building Workshop", category: "club", description: "Hands-on workshop by the science club" },
  { id: "j8", date: "2026-06-26", title: "Unit Test 1 Begins", category: "exam", description: "First unit test for classes I–IX" },
  { id: "j9", date: "2026-06-29", title: "Football Semi-Finals", category: "sports" },
  { id: "j10", date: "2026-06-30", title: "Unit Test 1 Ends", category: "exam" },

  // ===== JULY 2026 =====
  { id: "jl1", date: "2026-07-01", title: "Football Tournament Finals", category: "sports" },
  { id: "jl2", date: "2026-07-03", title: "Inter-House Singing Competition", category: "cultural", description: "Solo and group singing for all age groups" },
  { id: "jl3", date: "2026-07-06", title: "Van Mahotsav Week Begins", category: "cultural", description: "Tree planting and environment week" },
  { id: "jl4", date: "2026-07-07", title: "Bakrid / Eid ul-Adha", category: "holiday", description: "Festival of Sacrifice — School Holiday" },
  { id: "jl5", date: "2026-07-10", title: "Van Mahotsav Ends", category: "cultural" },
  { id: "jl6", date: "2026-07-13", title: "Inter-House Table Tennis Tournament", category: "sports", description: "TT competition for juniors and seniors" },
  { id: "jl7", date: "2026-07-14", title: "Hindi Debate Competition", category: "club", description: "Hindi literary club inter-house debate" },
  { id: "jl8", date: "2026-07-17", title: "Table Tennis Finals", category: "sports" },
  { id: "jl9", date: "2026-07-20", title: "Muharram", category: "holiday", description: "Islamic New Year — School Holiday" },
  { id: "jl10", date: "2026-07-21", title: "PTM (Term 1 Progress)", category: "academic", description: "Parent-Teacher Meeting to discuss first term progress" },
  { id: "jl11", date: "2026-07-23", title: "Robotics Club — Bot Challenge", category: "club", description: "Robotics club inter-house competition" },
  { id: "jl12", date: "2026-07-24", title: "Kargil Vijay Diwas", category: "cultural", description: "Tribute to Kargil war heroes — Special Assembly" },
  { id: "jl13", date: "2026-07-27", title: "Inter-House Badminton Tournament", category: "sports" },
  { id: "jl14", date: "2026-07-29", title: "Story Writing Competition", category: "club", description: "Creative writing competition for classes V–X" },
  { id: "jl15", date: "2026-07-31", title: "Badminton Finals", category: "sports" },

  // ===== AUGUST 2026 =====
  { id: "au1", date: "2026-08-03", title: "Friendship Day Celebration", category: "cultural", description: "Band-making and special assembly on friendship" },
  { id: "au2", date: "2026-08-05", title: "Inter-House Swimming Gala", category: "sports", description: "Swimming competitions for all age groups" },
  { id: "au3", date: "2026-08-07", title: "Sanskrit Diwas", category: "cultural", description: "Sanskrit week celebration — sloka recitation" },
  { id: "au4", date: "2026-08-10", title: "Photography Club Exhibition", category: "club", description: "Display of best student photographs" },
  { id: "au5", date: "2026-08-12", title: "Inter-House Volleyball Tournament", category: "sports" },
  { id: "au6", date: "2026-08-14", title: "Independence Day Eve — Cultural Program", category: "cultural", description: "Patriotic songs, dance, and drama performances" },
  { id: "au7", date: "2026-08-15", title: "Independence Day", category: "holiday", description: "78th Independence Day — Flag hoisting ceremony" },
  { id: "au8", date: "2026-08-17", title: "Raksha Bandhan", category: "holiday", description: "Festival of sibling bond — School Holiday" },
  { id: "au9", date: "2026-08-19", title: "Mid-Term Exam Begins", category: "exam", description: "Mid-term exams for classes I–IX" },
  { id: "au10", date: "2026-08-20", title: "Janmashtami", category: "holiday", description: "Birth of Lord Krishna — School Holiday" },
  { id: "au11", date: "2026-08-24", title: "Mid-Term Exam Continues", category: "exam" },
  { id: "au12", date: "2026-08-27", title: "Mid-Term Exam Ends", category: "exam" },
  { id: "au13", date: "2026-08-28", title: "Volleyball Finals", category: "sports" },
  { id: "au14", date: "2026-08-29", title: "National Sports Day", category: "sports", description: "Sports day celebration — tribute to Major Dhyan Chand" },
  { id: "au15", date: "2026-08-31", title: "Inter-School Quiz Competition", category: "academic", description: "Quiz competition hosted by the school" },

  // ===== SEPTEMBER 2026 =====
  { id: "s1", date: "2026-09-01", title: "Coding Club — Hackathon Day 1", category: "club", description: "24-hour hackathon for classes VIII–XII" },
  { id: "s2", date: "2026-09-02", title: "Coding Club — Hackathon Day 2", category: "club" },
  { id: "s3", date: "2026-09-04", title: "Inter-House Kho-Kho Tournament", category: "sports", description: "Traditional Indian sport competition" },
  { id: "s4", date: "2026-09-05", title: "Teachers' Day Celebration", category: "cultural", description: "Students organize special program for teachers" },
  { id: "s5", date: "2026-09-07", title: "Ganesh Chaturthi", category: "holiday", description: "Festival of Lord Ganesha — School Holiday" },
  { id: "s6", date: "2026-09-09", title: "Hindi Diwas Celebration", category: "cultural", description: "Hindi essay, poem recitation, and skit" },
  { id: "s7", date: "2026-09-10", title: "Kho-Kho Finals", category: "sports" },
  { id: "s8", date: "2026-09-11", title: "Science Exhibition", category: "academic", description: "Students showcase science projects and models" },
  { id: "s9", date: "2026-09-14", title: "Hindi Diwas", category: "cultural", description: "Official Hindi Diwas — special assembly" },
  { id: "s10", date: "2026-09-16", title: "Milad-un-Nabi", category: "holiday", description: "Prophet Muhammad's birthday — School Holiday" },
  { id: "s11", date: "2026-09-17", title: "Drama Club — One Act Play Competition", category: "club", description: "Inter-house drama competition" },
  { id: "s12", date: "2026-09-18", title: "Inter-House Chess Tournament", category: "sports", description: "Chess championship for all classes" },
  { id: "s13", date: "2026-09-21", title: "International Peace Day Assembly", category: "cultural" },
  { id: "s14", date: "2026-09-22", title: "Chess Finals", category: "sports" },
  { id: "s15", date: "2026-09-24", title: "Math Club — Sudoku Challenge", category: "club", description: "School-wide sudoku and puzzle competition" },
  { id: "s16", date: "2026-09-25", title: "Annual Sports Day Practice Begins", category: "sports", description: "Daily practice sessions for annual sports day" },
  { id: "s17", date: "2026-09-28", title: "Inter-House Throwball Tournament", category: "sports" },
  { id: "s18", date: "2026-09-30", title: "PTM (Mid-Term Results)", category: "academic", description: "Parent-Teacher Meeting for mid-term results" },

  // ===== OCTOBER 2026 =====
  { id: "o1", date: "2026-10-01", title: "Navratri Celebration Begins", category: "cultural", description: "Garba, dandiya, and festive activities in school" },
  { id: "o2", date: "2026-10-02", title: "Gandhi Jayanti", category: "holiday", description: "Mahatma Gandhi's birthday — National Holiday" },
  { id: "o3", date: "2026-10-05", title: "Dussehra Vacation Begins", category: "holiday" },
  { id: "o4", date: "2026-10-08", title: "Dussehra / Vijayadashami", category: "holiday", description: "Festival of victory of good over evil" },
  { id: "o5", date: "2026-10-12", title: "School Re-opens after Dussehra", category: "general" },
  { id: "o6", date: "2026-10-14", title: "Inter-House Rangoli Competition", category: "cultural", description: "Festive rangoli-making competition" },
  { id: "o7", date: "2026-10-16", title: "Inter-House Kabaddi Tournament", category: "sports", description: "Traditional sport competition" },
  { id: "o8", date: "2026-10-19", title: "Diwali Mela", category: "cultural", description: "School Diwali fair with food stalls, games, and crafts" },
  { id: "o9", date: "2026-10-20", title: "Diwali Vacation Begins", category: "holiday" },
  { id: "o10", date: "2026-10-22", title: "Diwali", category: "holiday", description: "Festival of Lights — School Holiday" },
  { id: "o11", date: "2026-10-24", title: "Govardhan Puja", category: "holiday" },
  { id: "o12", date: "2026-10-26", title: "School Re-opens after Diwali", category: "general" },
  { id: "o13", date: "2026-10-27", title: "Kabaddi Finals", category: "sports" },
  { id: "o14", date: "2026-10-29", title: "Halloween Fun Day (Pre-Primary)", category: "cultural", description: "Costume party and fun activities for little ones" },
  { id: "o15", date: "2026-10-30", title: "Eco Club — Clean Campus Drive", category: "club", description: "School-wide cleanliness and recycling drive" },
  { id: "o16", date: "2026-10-31", title: "National Unity Day", category: "cultural", description: "Sardar Patel Jayanti — pledge for national unity" },

  // ===== NOVEMBER 2026 =====
  { id: "n1", date: "2026-11-02", title: "Unit Test 2 Begins", category: "exam", description: "Second unit test for classes I–IX" },
  { id: "n2", date: "2026-11-05", title: "Unit Test 2 Ends", category: "exam" },
  { id: "n3", date: "2026-11-06", title: "Inter-House Athletics Meet Day 1", category: "sports", description: "Track and field events" },
  { id: "n4", date: "2026-11-07", title: "Inter-House Athletics Meet Day 2", category: "sports" },
  { id: "n5", date: "2026-11-09", title: "Guru Nanak Jayanti", category: "holiday", description: "Birth anniversary of Guru Nanak — School Holiday" },
  { id: "n6", date: "2026-11-11", title: "Inter-School Debate Competition", category: "academic", description: "Debate competition with neighboring schools" },
  { id: "n7", date: "2026-11-12", title: "Music Club — Band Performance", category: "club", description: "Student band performances during assembly" },
  { id: "n8", date: "2026-11-14", title: "Children's Day Celebration", category: "cultural", description: "Teachers perform for students — fun games and treats" },
  { id: "n9", date: "2026-11-16", title: "Annual Sports Day Rehearsal", category: "sports" },
  { id: "n10", date: "2026-11-18", title: "Annual Sports Day", category: "sports", description: "Grand annual sports day with chief guest, march past, and events" },
  { id: "n11", date: "2026-11-19", title: "Talent Show (Open Stage)", category: "cultural", description: "Students showcase any talent on the open stage" },
  { id: "n12", date: "2026-11-20", title: "Inter-School Science Olympiad", category: "academic" },
  { id: "n13", date: "2026-11-23", title: "Constitution Day Assembly", category: "cultural", description: "Reading the Preamble and awareness about the Constitution" },
  { id: "n14", date: "2026-11-25", title: "Annual Day Rehearsals Begin", category: "cultural", description: "Practice for the annual cultural program" },
  { id: "n15", date: "2026-11-27", title: "Inter-House Dance Competition", category: "cultural", description: "Solo, duet, and group dance competition" },
  { id: "n16", date: "2026-11-30", title: "Environment Club — Nature Trail", category: "club", description: "Field trip for nature observation and bird watching" },

  // ===== DECEMBER 2026 =====
  { id: "d1", date: "2026-12-01", title: "World AIDS Day Assembly", category: "cultural" },
  { id: "d2", date: "2026-12-03", title: "Annual Day Dress Rehearsal", category: "cultural" },
  { id: "d3", date: "2026-12-05", title: "Annual Day Celebration", category: "cultural", description: "Grand annual cultural program — drama, dance, and music performances" },
  { id: "d4", date: "2026-12-07", title: "Book Fair Begins", category: "academic", description: "Week-long book fair in school premises" },
  { id: "d5", date: "2026-12-09", title: "Inter-House Carrom Tournament", category: "sports" },
  { id: "d6", date: "2026-12-10", title: "Human Rights Day Assembly", category: "cultural" },
  { id: "d7", date: "2026-12-11", title: "Book Fair Ends", category: "academic" },
  { id: "d8", date: "2026-12-14", title: "Pre-Board Exams Begin (Class X & XII)", category: "exam", description: "Practice board exams for senior classes" },
  { id: "d9", date: "2026-12-16", title: "Vijay Diwas Assembly", category: "cultural", description: "Tribute to 1971 war heroes" },
  { id: "d10", date: "2026-12-18", title: "Carrom Finals", category: "sports" },
  { id: "d11", date: "2026-12-19", title: "Goa Liberation Day", category: "cultural" },
  { id: "d12", date: "2026-12-21", title: "Christmas Carnival", category: "cultural", description: "Santa visit, carol singing, and gift exchange" },
  { id: "d13", date: "2026-12-23", title: "Pre-Board Exams End", category: "exam" },
  { id: "d14", date: "2026-12-24", title: "Christmas Eve Celebration", category: "cultural" },
  { id: "d15", date: "2026-12-25", title: "Christmas Day", category: "holiday", description: "Merry Christmas — School Holiday" },
  { id: "d16", date: "2026-12-26", title: "Winter Vacation Begins", category: "holiday" },

  // ===== JANUARY 2027 =====
  { id: "ja1", date: "2027-01-04", title: "School Re-opens after Winter Break", category: "general" },
  { id: "ja2", date: "2027-01-06", title: "Inter-House Marathon (Cross Country)", category: "sports", description: "Long-distance running event within campus" },
  { id: "ja3", date: "2027-01-08", title: "Science Club — Innovation Fair", category: "club", description: "Students present innovative science projects" },
  { id: "ja4", date: "2027-01-11", title: "National Youth Day", category: "cultural", description: "Swami Vivekananda Jayanti — motivational assembly" },
  { id: "ja5", date: "2027-01-12", title: "Youth Day — Essay Writing Competition", category: "club" },
  { id: "ja6", date: "2027-01-13", title: "Lohri / Makar Sankranti Eve", category: "cultural", description: "Bonfire and festive celebration" },
  { id: "ja7", date: "2027-01-14", title: "Makar Sankranti / Pongal", category: "holiday", description: "Harvest festival — School Holiday" },
  { id: "ja8", date: "2027-01-15", title: "Army Day Assembly", category: "cultural" },
  { id: "ja9", date: "2027-01-18", title: "Inter-House Hockey Tournament", category: "sports" },
  { id: "ja10", date: "2027-01-19", title: "Math Club — Pi Day Celebration (early)", category: "club" },
  { id: "ja11", date: "2027-01-20", title: "Board Exam Revision Classes Begin", category: "academic", description: "Special revision classes for X and XII" },
  { id: "ja12", date: "2027-01-22", title: "Hockey Finals", category: "sports" },
  { id: "ja13", date: "2027-01-23", title: "Netaji Subhas Chandra Bose Jayanti", category: "cultural", description: "Parakram Diwas — Special Assembly" },
  { id: "ja14", date: "2027-01-25", title: "National Voters Day / Republic Day Eve", category: "cultural" },
  { id: "ja15", date: "2027-01-26", title: "Republic Day", category: "holiday", description: "76th Republic Day — Flag hoisting, parade, and cultural program" },
  { id: "ja16", date: "2027-01-27", title: "Art Club — Republic Day Art Contest", category: "club" },
  { id: "ja17", date: "2027-01-29", title: "Inter-School Sports Meet", category: "sports", description: "District-level inter-school sports competition" },

  // ===== FEBRUARY 2027 =====
  { id: "f1", date: "2027-02-01", title: "Final Exam Timetable Released", category: "academic" },
  { id: "f2", date: "2027-02-03", title: "Farewell Program (Class X & XII)", category: "cultural", description: "Farewell ceremony organized by juniors for seniors" },
  { id: "f3", date: "2027-02-05", title: "Inter-House Quiz Finals", category: "academic", description: "Grand quiz finale across all subjects" },
  { id: "f4", date: "2027-02-08", title: "Board Practical Exams Begin", category: "exam", description: "Practical exams for class X and XII" },
  { id: "f5", date: "2027-02-10", title: "Saraswati Puja / Vasant Panchami", category: "holiday", description: "Worship of Goddess Saraswati — School Holiday" },
  { id: "f6", date: "2027-02-12", title: "Board Practical Exams End", category: "exam" },
  { id: "f7", date: "2027-02-15", title: "Inter-House Tug of War", category: "sports", description: "Fun sports event — house spirit competition" },
  { id: "f8", date: "2027-02-17", title: "Maha Shivaratri", category: "holiday", description: "Night of Lord Shiva — School Holiday" },
  { id: "f9", date: "2027-02-18", title: "Board Exams Begin (CBSE)", category: "exam", description: "CBSE Board Examinations commence" },
  { id: "f10", date: "2027-02-19", title: "Shivaji Jayanti", category: "holiday", description: "Birth anniversary of Chhatrapati Shivaji Maharaj" },
  { id: "f11", date: "2027-02-22", title: "Annual Magazine Release", category: "academic", description: "School annual magazine 'Kaleidoscope' release" },
  { id: "f12", date: "2027-02-24", title: "Talent Hunt — Auditions", category: "club", description: "Open auditions for school talent showcase" },
  { id: "f13", date: "2027-02-26", title: "National Science Day", category: "academic", description: "Science Day celebration — experiments and demos" },

  // ===== MARCH 2027 =====
  { id: "mr1", date: "2027-03-01", title: "Final Exams Begin (I–IX)", category: "exam", description: "Annual final examinations" },
  { id: "mr2", date: "2027-03-08", title: "International Women's Day Assembly", category: "cultural", description: "Celebrating women achievers — special assembly" },
  { id: "mr3", date: "2027-03-12", title: "Final Exams Continue", category: "exam" },
  { id: "mr4", date: "2027-03-14", title: "Holi Celebration (Early)", category: "cultural", description: "Colours play and festive assembly in school" },
  { id: "mr5", date: "2027-03-15", title: "Holi", category: "holiday", description: "Festival of Colors — School Holiday" },
  { id: "mr6", date: "2027-03-18", title: "Final Exams End", category: "exam" },
  { id: "mr7", date: "2027-03-22", title: "World Water Day Assembly", category: "cultural" },
  { id: "mr8", date: "2027-03-24", title: "Annual PTM & Result Day", category: "academic", description: "Parent-Teacher Meeting — annual results" },
  { id: "mr9", date: "2027-03-25", title: "Summer Vacation Begins", category: "holiday", description: "School closes for summer break" },
  { id: "mr10", date: "2027-03-29", title: "Ram Navami", category: "holiday", description: "Birth of Lord Rama — Holiday" },
  { id: "mr11", date: "2027-03-31", title: "Academic Year Ends", category: "general", description: "Official end of the 2026–27 academic year" },
];

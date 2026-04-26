import {
  db,
  workersTable,
  customersTable,
  bookingsTable,
  attendanceTable,
  tasksTable,
  reviewsTable,
  activityTable,
} from "@workspace/db";
import { sql } from "drizzle-orm";

async function reset() {
  console.log("Clearing existing data...");
  await db.delete(activityTable);
  await db.delete(reviewsTable);
  await db.delete(attendanceTable);
  await db.delete(tasksTable);
  await db.delete(bookingsTable);
  await db.delete(customersTable);
  await db.delete(workersTable);
  // Reset sequences so IDs start at 1
  await db.execute(sql`ALTER SEQUENCE workers_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE customers_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE bookings_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE attendance_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE tasks_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE reviews_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE activity_id_seq RESTART WITH 1`);
}

async function seed() {
  await reset();

  console.log("Seeding workers...");
  const workers = await db
    .insert(workersTable)
    .values([
      {
        fullName: "Ayesha Bibi",
        phone: "+92 300 1234567",
        photoUrl: "/workers/ayesha.png",
        category: "maid",
        skills: ["Cleaning", "Cooking", "Laundry", "Childcare"],
        bio: "Hardworking and reliable. 8 years of experience working with families in DHA Karachi. Trusted by long-term clients.",
        experienceYears: 8,
        expectedMonthlySalary: 28000,
        hourlyRate: 600,
        city: "Karachi",
        serviceArea: "DHA, Clifton",
        cnicNumber: "42101-1234567-2",
        cnicImageUrl: null,
        verificationStatus: "approved",
        averageRating: "4.80",
        reviewCount: 12,
        completedJobs: 14,
        availability: "available",
      },
      {
        fullName: "Fatima Noor",
        phone: "+92 321 9876543",
        photoUrl: "/workers/fatima.png",
        category: "cook",
        skills: ["Pakistani Cuisine", "Continental", "Baking", "Meal Prep"],
        bio: "Trained cook specializing in traditional Pakistani and Mughlai cuisine. Known for spotless kitchen habits.",
        experienceYears: 12,
        expectedMonthlySalary: 45000,
        hourlyRate: 1200,
        city: "Lahore",
        serviceArea: "Gulberg, Model Town",
        cnicNumber: "35202-7654321-4",
        cnicImageUrl: null,
        verificationStatus: "approved",
        averageRating: "4.90",
        reviewCount: 8,
        completedJobs: 10,
        availability: "available",
      },
      {
        fullName: "Imran Khan",
        phone: "+92 333 5550101",
        photoUrl: "/workers/imran.png",
        category: "driver",
        skills: ["Sedan", "SUV", "Long-distance", "Defensive driving"],
        bio: "Professional driver with LTV license. Punctual, polite, and familiar with all major cities in Punjab.",
        experienceYears: 10,
        expectedMonthlySalary: 38000,
        hourlyRate: 900,
        city: "Islamabad",
        serviceArea: "F-sectors, Bahria",
        cnicNumber: "61101-3344556-7",
        cnicImageUrl: null,
        verificationStatus: "approved",
        averageRating: "4.70",
        reviewCount: 6,
        completedJobs: 9,
        availability: "busy",
      },
      {
        fullName: "Rashid Ali",
        phone: "+92 345 1112233",
        photoUrl: "/workers/rashid.png",
        category: "guard",
        skills: ["CCTV monitoring", "Patrol", "First aid", "Visitor screening"],
        bio: "Ex-army background. 15 years of security experience at residential and commercial properties.",
        experienceYears: 15,
        expectedMonthlySalary: 35000,
        hourlyRate: 800,
        city: "Karachi",
        serviceArea: "Citywide",
        cnicNumber: "42301-9988776-5",
        cnicImageUrl: null,
        verificationStatus: "approved",
        averageRating: "4.60",
        reviewCount: 4,
        completedJobs: 7,
        availability: "available",
      },
      {
        fullName: "Asif Mehmood",
        phone: "+92 312 4567890",
        photoUrl: "/workers/asif.png",
        category: "cook",
        skills: ["Continental", "Bakery", "Fast food", "Catering"],
        bio: "Hotel-trained cook ready for full-time placement or short-term events.",
        experienceYears: 5,
        expectedMonthlySalary: 32000,
        hourlyRate: 800,
        city: "Lahore",
        serviceArea: "DHA, Cantt",
        cnicNumber: "35201-1122334-9",
        cnicImageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600",
        verificationStatus: "pending",
        averageRating: "0",
        reviewCount: 0,
        completedJobs: 0,
        availability: "available",
      },
      {
        fullName: "Noor Fatima",
        phone: "+92 301 7778899",
        photoUrl: "/workers/noor.png",
        category: "nanny",
        skills: ["Infant care", "Toddler care", "Tutoring", "First aid"],
        bio: "Loving and patient with children. Certified in pediatric first aid.",
        experienceYears: 4,
        expectedMonthlySalary: 30000,
        hourlyRate: 700,
        city: "Karachi",
        serviceArea: "Gulshan, North Nazimabad",
        cnicNumber: "42201-5566778-3",
        cnicImageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600",
        verificationStatus: "pending",
        averageRating: "0",
        reviewCount: 0,
        completedJobs: 0,
        availability: "available",
      },
      {
        fullName: "Tariq Mahmood",
        phone: "+92 333 4445556",
        photoUrl: null,
        category: "gardener",
        skills: ["Lawn care", "Pruning", "Landscaping"],
        bio: "Cared for residential gardens for 6 years. Comfortable with seasonal planting.",
        experienceYears: 6,
        expectedMonthlySalary: 22000,
        hourlyRate: 500,
        city: "Islamabad",
        serviceArea: "F-7, F-8, E-7",
        cnicNumber: "61101-2233445-6",
        cnicImageUrl: null,
        verificationStatus: "rejected",
        rejectionReason: "CNIC photo unclear — please re-submit a sharper image.",
        averageRating: "0",
        reviewCount: 0,
        completedJobs: 0,
        availability: "offline",
      },
    ])
    .returning();

  console.log(`  ${workers.length} workers seeded.`);

  console.log("Seeding customers...");
  const customers = await db
    .insert(customersTable)
    .values([
      {
        fullName: "Sara Ahmed",
        phone: "+92 300 1110001",
        city: "Karachi",
        photoUrl: null,
      },
      {
        fullName: "Bilal Hussain",
        phone: "+92 321 2220002",
        city: "Lahore",
        photoUrl: null,
      },
      {
        fullName: "Maham Iqbal",
        phone: "+92 333 3330003",
        city: "Islamabad",
        photoUrl: null,
      },
    ])
    .returning();
  console.log(`  ${customers.length} customers seeded.`);

  const ayesha = workers[0]!;
  const fatima = workers[1]!;
  const imran = workers[2]!;
  const rashid = workers[3]!;

  const sara = customers[0]!;
  const bilal = customers[1]!;
  const maham = customers[2]!;

  console.log("Seeding bookings...");
  const bookings = await db
    .insert(bookingsTable)
    .values([
      {
        customerId: sara.id,
        workerId: ayesha.id,
        startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
        monthlySalary: 28000,
        status: "active",
        notes: "Weekday cleaning + cooking. Sundays off.",
      },
      {
        customerId: bilal.id,
        workerId: fatima.id,
        startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12),
        monthlySalary: 45000,
        status: "active",
        notes: "Lunch and dinner cooking, 6 days a week.",
      },
      {
        customerId: maham.id,
        workerId: rashid.id,
        startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
        monthlySalary: 35000,
        status: "completed",
        notes: "Night shift security.",
      },
    ])
    .returning();
  console.log(`  ${bookings.length} bookings seeded.`);

  console.log("Seeding attendance entries...");
  const today = new Date();
  const ayeshaBooking = bookings[0]!;
  const fatimaBooking = bookings[1]!;
  const attendanceRows: {
    bookingId: number;
    date: string;
    status: string;
    checkInTime?: string;
  }[] = [];

  // Last 18 days for ayesha booking — mostly present, a few absent
  for (let i = 18; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const isSunday = d.getDay() === 0;
    if (isSunday) continue;
    const status = i === 5 || i === 12 ? "absent" : "present";
    attendanceRows.push({
      bookingId: ayeshaBooking.id,
      date: d.toISOString().slice(0, 10),
      status,
      checkInTime: status === "present" ? "08:30" : undefined,
    });
  }
  // Last 10 days for fatima booking — strong streak
  for (let i = 10; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (d.getDay() === 0) continue;
    attendanceRows.push({
      bookingId: fatimaBooking.id,
      date: d.toISOString().slice(0, 10),
      status: "present",
      checkInTime: "11:00",
    });
  }

  if (attendanceRows.length > 0) {
    await db.insert(attendanceTable).values(attendanceRows);
  }
  console.log(`  ${attendanceRows.length} attendance entries seeded.`);

  console.log("Seeding tasks...");
  const tasks = await db
    .insert(tasksTable)
    .values([
      {
        customerId: sara.id,
        title: "Deep clean 3-bedroom apartment",
        description:
          "Looking for a thorough deep clean before guests arrive. All bathrooms, kitchen, and balconies. Cleaning supplies will be provided.",
        category: "maid",
        durationHours: 5,
        location: "DHA Phase 6, Lane 4",
        city: "Karachi",
        budget: 4500,
        status: "open",
      },
      {
        customerId: bilal.id,
        title: "One-day cook for dinner party (12 guests)",
        description:
          "Need a cook for a small dinner party. Mughlai-style menu. Will share final menu after acceptance.",
        category: "cook",
        durationHours: 6,
        location: "Gulberg III",
        city: "Lahore",
        budget: 8000,
        status: "open",
        scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      },
      {
        customerId: maham.id,
        title: "Airport pickup and drop (Islamabad airport)",
        description:
          "Pickup at 6 AM, drop at airport. Honda City sedan provided. Need a calm and punctual driver.",
        category: "driver",
        durationHours: 3,
        location: "F-8/3",
        city: "Islamabad",
        budget: 3500,
        status: "accepted",
        scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
        acceptedByWorkerId: imran.id,
        acceptedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
      },
      {
        customerId: sara.id,
        title: "Weekend gardening — lawn trim + hedge cleanup",
        description:
          "Front and back lawn need trimming, hedges shaped, and weeds cleared. Approx half-day work.",
        category: "gardener",
        durationHours: 4,
        location: "DHA Phase 8",
        city: "Karachi",
        budget: 3000,
        status: "completed",
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        acceptedByWorkerId: rashid.id,
        acceptedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
      },
    ])
    .returning();
  console.log(`  ${tasks.length} tasks seeded.`);

  console.log("Seeding reviews...");
  await db.insert(reviewsTable).values([
    {
      workerId: ayesha.id,
      customerId: sara.id,
      bookingId: ayeshaBooking.id,
      rating: 5,
      comment: "Ayesha is fantastic. Always on time, very thorough, and great with the kids.",
    },
    {
      workerId: ayesha.id,
      customerId: bilal.id,
      rating: 5,
      comment: "Highly recommend. Trustworthy and reliable.",
    },
    {
      workerId: ayesha.id,
      customerId: maham.id,
      rating: 4,
      comment: "Very good worker, professional attitude.",
    },
    {
      workerId: fatima.id,
      customerId: bilal.id,
      bookingId: fatimaBooking.id,
      rating: 5,
      comment: "Best biryani I have had at home. Kitchen always spotless.",
    },
    {
      workerId: fatima.id,
      customerId: sara.id,
      rating: 5,
      comment: "Catered our family event flawlessly.",
    },
    {
      workerId: imran.id,
      customerId: maham.id,
      rating: 5,
      comment: "Smooth driver, very polite, knows the city.",
    },
    {
      workerId: rashid.id,
      customerId: maham.id,
      rating: 4,
      comment: "Reliable night guard. Felt safe.",
    },
  ]);
  console.log("  Reviews seeded.");

  console.log("Seeding activity feed...");
  await db.insert(activityTable).values([
    {
      type: "worker_registered",
      title: "New worker registered",
      description: "Asif Mehmood joined as cook in Lahore",
      actorName: "Asif Mehmood",
    },
    {
      type: "worker_registered",
      title: "New worker registered",
      description: "Noor Fatima joined as nanny in Karachi",
      actorName: "Noor Fatima",
    },
    {
      type: "worker_verified",
      title: "Worker verified",
      description: "Ayesha Bibi is now a verified maid",
      actorName: "Admin",
    },
    {
      type: "worker_verified",
      title: "Worker verified",
      description: "Fatima Noor is now a verified cook",
      actorName: "Admin",
    },
    {
      type: "worker_rejected",
      title: "Worker rejected",
      description: "Tariq Mahmood's application was rejected",
      actorName: "Admin",
    },
    {
      type: "booking_created",
      title: "Monthly hire confirmed",
      description: "Sara Ahmed hired Ayesha Bibi at PKR 28,000/mo",
      actorName: "Sara Ahmed",
    },
    {
      type: "booking_created",
      title: "Monthly hire confirmed",
      description: "Bilal Hussain hired Fatima Noor at PKR 45,000/mo",
      actorName: "Bilal Hussain",
    },
    {
      type: "task_created",
      title: "New task posted",
      description: "Sara Ahmed posted \"Deep clean 3-bedroom apartment\" in Karachi for PKR 4,500",
      actorName: "Sara Ahmed",
    },
    {
      type: "task_accepted",
      title: "Task accepted",
      description: "Imran Khan accepted \"Airport pickup and drop\"",
      actorName: "Imran Khan",
    },
    {
      type: "task_completed",
      title: "Task completed",
      description: "\"Weekend gardening\" was marked complete",
      actorName: "Rashid Ali",
    },
    {
      type: "review_created",
      title: "5-star review",
      description: "Sara Ahmed reviewed Ayesha Bibi",
      actorName: "Sara Ahmed",
    },
  ]);
  console.log("  Activity feed seeded.");

  console.log("Seed complete.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });

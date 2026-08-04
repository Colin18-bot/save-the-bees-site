export const queenColourReference = [
  {
    ending: "1 or 6",
    colour: "White",
    example: "2026",
    swatch: "bg-white border-gray-300",
  },
  {
    ending: "2 or 7",
    colour: "Yellow",
    example: "2027",
    swatch: "bg-yellow-300 border-yellow-400",
  },
  {
    ending: "3 or 8",
    colour: "Red",
    example: "2028",
    swatch: "bg-red-500 border-red-600",
  },
  {
    ending: "4 or 9",
    colour: "Green",
    example: "2029",
    swatch: "bg-green-600 border-green-700",
  },
  {
    ending: "5 or 0",
    colour: "Blue",
    example: "2030",
    swatch: "bg-blue-600 border-blue-700",
  },
];

export const queenPreviewData = {
  apiaries: [
    {
      id: "main-apiary",
      name: "Main Apiary",
    },
    {
      id: "orchard-apiary",
      name: "Orchard Apiary",
    },
  ],

  hives: [
    {
      id: "hive-a",
      apiaryId: "main-apiary",
      name: "Hive A",
      status: "Introduction pending",
      attention: true,

      currentQueen: {
        id: "queen-004",
        reference: "Queen Q-004",
        year: 2026,
        expectedColour: "White",
        actualColour: "White",
        marked: "Yes",
        clipped: "No",
        origin: "Purchased mated queen",
        supplier: "Example Queen Breeder",
        emergedOn: "Unknown",
        introducedOn: "6 August 2026",
        currentSince: "6 August 2026",
        lastSeen: "Not yet recorded",
        status: "Introduced — acceptance pending",
        notes:
          "Introduced in a travelling cage after the previous queen swarmed.",
      },

      previousQueens: [
        {
          id: "queen-001",
          reference: "Queen Q-001",
          period: "24 May 2025 – 3 August 2026",
          summary: "2025 blue-marked, home-reared queen",
          outcome: "Swarmed",
          currentLocation: "Unknown after swarm",
        },
        {
          id: "queen-003",
          reference: "Queen Q-003",
          period: "12 April 2025 – 2 May 2025",
          summary: "Unmarked virgin queen",
          outcome: "Presumed lost",
          currentLocation: "No longer assigned",
        },
      ],

      nextAction: {
        title: "Check queen acceptance",
        due: "10 August 2026",
        note:
          "Confirm the introduced queen has been released and accepted. Avoid a full inspection unless necessary.",
      },

      progress: [
        {
          date: "3 August 2026",
          title: "Previous queen swarmed",
          detail: "Queen Q-001 assignment ended.",
        },
        {
          date: "6 August 2026",
          title: "Purchased mated queen introduced",
          detail: "Queen Q-004 created and assigned to Hive A.",
        },
        {
          date: "10 August 2026",
          title: "Acceptance check due",
          detail:
            "Record whether the queen has been released and accepted.",
        },
      ],

      events: [
        {
          date: "6 August 2026",
          type: "Queen introduced",
          detail: "Purchased mated queen introduced to Hive A.",
        },
        {
          date: "3 August 2026",
          type: "Swarm recorded",
          detail: "Previous queen and swarm left Hive A.",
        },
        {
          date: "27 July 2026",
          type: "Queen seen",
          detail: "Queen Q-001 seen during inspection.",
        },
      ],
    },

    {
      id: "nucleus-b",
      apiaryId: "main-apiary",
      name: "Nucleus B",
      status: "Queen present",
      attention: false,

      currentQueen: {
        id: "queen-002",
        reference: "Queen Q-002",
        year: 2025,
        expectedColour: "Blue",
        actualColour: "Blue",
        marked: "Yes",
        clipped: "No",
        origin: "Transferred during split",
        supplier: "Home reared",
        emergedOn: "18 May 2025",
        introducedOn: "Not applicable",
        currentSince: "3 August 2026",
        lastSeen: "3 August 2026",
        status: "Present",
        notes:
          "Transferred from Hive A when Nucleus B was created.",
      },

      previousQueens: [],

      nextAction: {
        title: "Routine inspection",
        due: "17 August 2026",
        note:
          "Check brood pattern, stores and space in the nucleus.",
      },

      progress: [
        {
          date: "3 August 2026",
          title: "Colony split recorded",
          detail: "Nucleus B created from Hive A.",
        },
        {
          date: "3 August 2026",
          title: "Queen transferred",
          detail: "Queen Q-002 moved from Hive A to Nucleus B.",
        },
      ],

      events: [
        {
          date: "3 August 2026",
          type: "Queen transferred",
          detail: "Existing queen assigned to Nucleus B.",
        },
        {
          date: "3 August 2026",
          type: "Split recorded",
          detail: "Nucleus B created from Hive A.",
        },
      ],
    },

    {
      id: "hive-c",
      apiaryId: "orchard-apiary",
      name: "Hive C",
      status: "Queen rearing",
      attention: true,

      currentQueen: null,

      transition: {
        method: "Frame of eggs or young larvae",
        startedOn: "1 August 2026",
        status: "Queen cells expected",
        expectedCheck: "8 August 2026",
        note:
          "No individual queen has been created yet because emergence has not been confirmed.",
      },

      previousQueens: [
        {
          id: "queen-005",
          reference: "Queen Q-005",
          period: "10 June 2025 – 1 August 2026",
          summary: "2025 blue-marked queen",
          outcome: "Removed",
          currentLocation: "No longer assigned",
        },
      ],

      nextAction: {
        title: "Check for started queen cells",
        due: "8 August 2026",
        note:
          "Record whether emergency queen cells have been started. Do not create a Queen record until emergence is known or reasonably confirmed.",
      },

      progress: [
        {
          date: "1 August 2026",
          title: "Brood frame added",
          detail:
            "Frame containing eggs and young larvae added from Hive D.",
        },
        {
          date: "8 August 2026",
          title: "Queen-cell check due",
          detail:
            "Record open, charged or sealed queen cells.",
        },
      ],

      events: [
        {
          date: "1 August 2026",
          type: "Queen rearing started",
          detail: "Frame of eggs and young larvae added.",
        },
        {
          date: "1 August 2026",
          type: "Previous queen removed",
          detail: "Queen Q-005 assignment ended.",
        },
      ],
    },
  ],
};
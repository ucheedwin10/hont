import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const opportunities = [
  {
    title: "2026 World Bank Group Africa Fellowship Program",
    organization: "World Bank Group (WBG) Africa Region",
    type: "fellowship",
    description: "Designed for Ph.D. candidates and recent graduates from Sub-Saharan Africa. Six-month program (January–June 2026) contributing to research, economic policy, technical assistance, and data analysis to build a pipeline of African scholars shaping continental policy.",
    deadline: null,
    amount: "Consultant compensation + round-trip economy airfare",
    location: "Washington, D.C. or Country Offices",
    requirements: [
      "Sub-Saharan Africa national",
      "Under 32 years old",
      "Enrolled in Ph.D. (final year) or recent graduate (within 3 years)",
      "Excellent command of English",
      "Strong quantitative and analytical skills"
    ],
    questions: [
      {
        id: "q1",
        question: "Describe a specific policy challenge facing Sub-Saharan Africa that you are passionate about addressing. How has your academic research prepared you to contribute to solving this challenge?",
        word_limit: 500,
        required: true
      },
      {
        id: "q2",
        question: "How do you envision using the skills and experience gained from this fellowship to contribute to Africa's development in the next 5-10 years?",
        word_limit: 400,
        required: true
      },
      {
        id: "q3",
        question: "Describe your quantitative and analytical skills. Provide an example of a research project where you applied these skills to generate actionable insights.",
        word_limit: 350,
        required: true
      }
    ],
    tags: ["africa", "research", "policy", "international"],
    is_public: true,
    status: "active",
    user_id: null
  },
  {
    title: "Ibrahim Leadership Fellowships",
    organization: "Mo Ibrahim Foundation",
    type: "fellowship",
    description: "12-month programme supporting professional development of future African leaders. Fellows hosted at African Development Bank, International Trade Centre, or UNECA to gain technical leadership skills and contribute to research and policy design. Includes mentorship from global leaders.",
    deadline: null,
    amount: "$100,000 stipend",
    location: "Various (AfDB, ITC, or UNECA headquarters)",
    requirements: [
      "National of an African country",
      "7-10 years of relevant work experience",
      "Master's degree",
      "Under 40 years old (or 45 for women with children)"
    ],
    questions: [
      {
        id: "q1",
        question: "Describe your vision for Africa's future and explain how your professional experience has prepared you to contribute to this vision as a leader.",
        word_limit: 500,
        required: true
      },
      {
        id: "q2",
        question: "What specific leadership challenge in Africa would you like to address during this fellowship, and what approach would you take?",
        word_limit: 400,
        required: true
      },
      {
        id: "q3",
        question: "Describe a time when you demonstrated exceptional leadership in a challenging situation. What was the outcome and what did you learn?",
        word_limit: 350,
        required: true
      }
    ],
    tags: ["africa", "leadership", "policy", "international"],
    is_public: true,
    status: "active",
    user_id: null
  },
  {
    title: "TEF Entrepreneurship Programme",
    organization: "The Tony Elumelu Foundation",
    type: "grant",
    description: "Philanthropic initiative empowering African entrepreneurs through training, mentorship, and funding. Rigorous 7-phase process including application, training, business plan development, and pitching. Targets entrepreneurs with feasible, scalable business ideas demonstrating market opportunity and financial understanding.",
    deadline: "2026-03-01T23:59:59Z",
    amount: "$5,000 non-refundable seed capital",
    location: "Africa (Business must be established in Africa)",
    requirements: [
      "African national 18 years and above",
      "Business idea or business no older than 5 years",
      "Reside in Africa and plan to establish business in Africa",
      "Not a previous TEF beneficiary"
    ],
    questions: [
      {
        id: "q1",
        question: "Describe your business idea or existing business. What problem does it solve, and what is your unique value proposition in the market?",
        word_limit: 500,
        required: true
      },
      {
        id: "q2",
        question: "Explain your business model and how you plan to achieve profitability. Include your target market, revenue streams, and growth strategy.",
        word_limit: 450,
        required: true
      },
      {
        id: "q3",
        question: "How will the $5,000 seed capital be utilized to grow your business? Provide a brief breakdown of planned expenditures.",
        word_limit: 300,
        required: true
      }
    ],
    tags: ["africa", "entrepreneurship", "business", "grant"],
    is_public: true,
    status: "active",
    user_id: null
  },
  {
    title: "The Rhodes Scholarships for West Africa",
    organization: "Rhodes Trust",
    type: "scholarship",
    description: "Prestigious postgraduate scholarship for students from West Africa to study at the University of Oxford. Covers course fees and provides stipend for living expenses. Targets candidates from 18 West African countries including Nigeria, Ghana, and Senegal.",
    deadline: "2025-08-28T23:59:59Z",
    amount: "Fully funded (tuition + living stipend)",
    location: "University of Oxford, UK",
    requirements: [
      "Citizen of Benin, Burkina Faso, Cape Verde, Gambia, Ghana, Guinea, Guinea-Bissau, Ivory Coast, Liberia, Mali, Mauritania, Niger, Nigeria, St Helena, Senegal, Sierra Leone, São Tomé and Principe, or Togo",
      "Strong academic record",
      "Leadership potential"
    ],
    questions: [
      {
        id: "q1",
        question: "Describe a significant leadership experience that has shaped your character and aspirations. What did you learn about yourself and your capacity to effect change?",
        word_limit: 500,
        required: true
      },
      {
        id: "q2",
        question: "How do you plan to use your Oxford education to contribute to the development of West Africa? Be specific about the impact you hope to make.",
        word_limit: 450,
        required: true
      },
      {
        id: "q3",
        question: "What does 'fighting the world's fight' mean to you, and how have you demonstrated this commitment in your life so far?",
        word_limit: 400,
        required: true
      }
    ],
    tags: ["africa", "scholarship", "oxford", "international", "postgraduate"],
    is_public: true,
    status: "active",
    user_id: null
  },
  {
    title: "Mandela Rhodes Scholarship",
    organization: "Mandela Rhodes Foundation",
    type: "scholarship",
    description: "Provides funding for up to two years of postgraduate study (Honours or Master's) at a South African university. Aims to build exceptional leadership capacity in Africa, focusing on reconciliation, education, entrepreneurship, and leadership. Scholars undertake a leadership development program while in residence.",
    deadline: null,
    amount: "Comprehensive (tuition, accommodation, meals, book allowance, travel)",
    location: "South Africa",
    requirements: [
      "Citizen of an African country",
      "Under the age of 30",
      "Study towards Honours or Masters degrees at recognised South African institutions",
      "Outstanding academic achievements and leadership ability"
    ],
    questions: [
      {
        id: "q1",
        question: "How do you embody the values of Nelson Mandela and Cecil John Rhodes in your approach to leadership and service? Provide specific examples.",
        word_limit: 500,
        required: true
      },
      {
        id: "q2",
        question: "Describe your commitment to reconciliation and building bridges across communities. How have you contributed to unity in divided contexts?",
        word_limit: 400,
        required: true
      },
      {
        id: "q3",
        question: "What is your vision for Africa's future, and how will your postgraduate studies and this scholarship help you realize that vision?",
        word_limit: 400,
        required: true
      }
    ],
    tags: ["africa", "scholarship", "south-africa", "leadership", "postgraduate"],
    is_public: true,
    status: "active",
    user_id: null
  },
  {
    title: "Fulbright Foreign Student Program 2025",
    organization: "U.S. Government / IIE",
    type: "scholarship",
    description: "Provides financial assistance for maximum two years of study toward graduate degree (Master's or Ph.D.) in U.S. university. Designed to strengthen African universities through higher degree training for faculty members. Candidates with disabilities encouraged to apply with special accommodations provided.",
    deadline: null,
    amount: "Tuition, living stipend, academic allowances, and travel funds",
    location: "United States",
    requirements: [
      "Bachelor's degree",
      "Strong academic record",
      "English proficiency",
      "No recent Fulbright experience (within 3 years)"
    ],
    questions: [
      {
        id: "q1",
        question: "Describe your proposed study objectives in the United States. How does your academic and professional background prepare you for this program?",
        word_limit: 500,
        required: true
      },
      {
        id: "q2",
        question: "How will your Fulbright experience benefit your home country and contribute to mutual understanding between your country and the United States?",
        word_limit: 400,
        required: true
      },
      {
        id: "q3",
        question: "Describe a significant cross-cultural experience you have had. What did you learn from it, and how has it influenced your worldview?",
        word_limit: 350,
        required: true
      }
    ],
    tags: ["usa", "scholarship", "graduate", "international"],
    is_public: true,
    status: "active",
    user_id: null
  },
  {
    title: "Tarbell Fellowship Program 2026",
    organization: "Tarbell Fellowship",
    type: "fellowship",
    description: "One-year program for journalists interested in covering artificial intelligence. Fellows receive support to produce high-impact journalism and attend a summit.",
    deadline: "2026-01-07T23:59:59Z",
    amount: "$80,000 stipend + fully funded summit",
    location: "Remote / San Francisco Bay Area (Summit)",
    requirements: [
      "Early-career journalists",
      "Interested in covering artificial intelligence"
    ],
    questions: [
      {
        id: "q1",
        question: "What aspect of artificial intelligence do you believe is most underreported, and how would you approach covering it during this fellowship?",
        word_limit: 500,
        required: true
      },
      {
        id: "q2",
        question: "Describe your journalism background and provide examples of investigative or explanatory work you have produced. What makes your approach distinctive?",
        word_limit: 450,
        required: true
      },
      {
        id: "q3",
        question: "How do you plan to make complex AI topics accessible and engaging to a general audience?",
        word_limit: 300,
        required: true
      }
    ],
    tags: ["journalism", "ai", "technology", "media"],
    is_public: true,
    status: "active",
    user_id: null
  },
  {
    title: "Nieman-Berkman Klein Fellowship in Journalism Innovation",
    organization: "Harvard University (Nieman Foundation)",
    type: "fellowship",
    description: "Brings individuals to Harvard University to work on specific research or projects relating to journalism innovation. Year-long cohort program for study at Harvard.",
    deadline: "2025-12-01T23:59:59Z",
    amount: "$75,000 stipend",
    location: "Harvard University, USA",
    requirements: [
      "Individuals working on journalism innovation",
      "Demonstrated experience in journalism"
    ],
    questions: [
      {
        id: "q1",
        question: "Describe the journalism innovation project you would pursue during this fellowship. What problem does it solve and what impact could it have on the industry?",
        word_limit: 500,
        required: true
      },
      {
        id: "q2",
        question: "How has your career demonstrated a commitment to journalism innovation? Provide specific examples of innovative work or approaches you have implemented.",
        word_limit: 450,
        required: true
      },
      {
        id: "q3",
        question: "How would being part of the Harvard community and the Nieman fellowship cohort enhance your project and professional development?",
        word_limit: 300,
        required: true
      }
    ],
    tags: ["journalism", "innovation", "harvard", "media", "research"],
    is_public: true,
    status: "active",
    user_id: null
  },
  {
    title: "Halcyon's 2026 Global Climate Fellowship",
    organization: "Halcyon",
    type: "fellowship",
    description: "Serves founders across the world tackling climate challenges. Supports young entrepreneurs with funding and residency opportunities.",
    deadline: "2026-01-15T23:59:59Z",
    amount: "Fully funded (travel/residency)",
    location: "Washington, DC and Los Angeles, California",
    requirements: [
      "Founders tackling climate challenges",
      "Scalable climate solution"
    ],
    questions: [
      {
        id: "q1",
        question: "Describe your climate venture and the specific environmental challenge it addresses. What is your theory of change and how will you measure impact?",
        word_limit: 500,
        required: true
      },
      {
        id: "q2",
        question: "What is your business model for achieving both environmental impact and financial sustainability? How scalable is your solution?",
        word_limit: 400,
        required: true
      },
      {
        id: "q3",
        question: "Why is now the right time for your climate solution, and what unique perspective or expertise do you bring to this challenge?",
        word_limit: 350,
        required: true
      }
    ],
    tags: ["climate", "entrepreneurship", "environment", "social-impact"],
    is_public: true,
    status: "active",
    user_id: null
  },
  {
    title: "Jacobs Foundation CIFAR Research Fellowship 2027/2029",
    organization: "Jacobs Foundation",
    type: "fellowship",
    description: "Fellowship for early- and mid-career researchers. Provides significant funding for research activities.",
    deadline: "2026-02-02T23:59:59Z",
    amount: "CHF 150,000 in funding",
    location: "Global",
    requirements: [
      "Early- and mid-career researchers",
      "Research focus aligned with foundation goals"
    ],
    questions: [
      {
        id: "q1",
        question: "Describe your proposed research project and its potential contribution to child and youth development. What makes this research innovative?",
        word_limit: 500,
        required: true
      },
      {
        id: "q2",
        question: "How does your research methodology advance the field? Describe your approach and expected outcomes.",
        word_limit: 400,
        required: true
      },
      {
        id: "q3",
        question: "How do you plan to translate your research findings into practical applications that benefit children and young people?",
        word_limit: 350,
        required: true
      }
    ],
    tags: ["research", "academic", "child-development", "global"],
    is_public: true,
    status: "active",
    user_id: null
  },
  {
    title: "Oxford Institute for Ethics in AI Accelerator Fellowship",
    organization: "University of Oxford",
    type: "fellowship",
    description: "Pioneering initiative of the Institute for Ethics in AI to support researchers. Provides monthly stipend for programme duration.",
    deadline: "2026-01-10T23:59:59Z",
    amount: "£2,000 monthly stipend",
    location: "Oxford, UK",
    requirements: [
      "Researchers in Ethics in AI",
      "Strong research background"
    ],
    questions: [
      {
        id: "q1",
        question: "What ethical challenge in AI development do you believe requires urgent attention? Describe your research approach to addressing this challenge.",
        word_limit: 500,
        required: true
      },
      {
        id: "q2",
        question: "How does your background prepare you to contribute to the field of AI ethics? Describe relevant research, publications, or professional experience.",
        word_limit: 400,
        required: true
      },
      {
        id: "q3",
        question: "How would you engage with policymakers, technologists, and the public to ensure your research has real-world impact?",
        word_limit: 350,
        required: true
      }
    ],
    tags: ["ai", "ethics", "research", "oxford", "technology"],
    is_public: true,
    status: "active",
    user_id: null
  },
  {
    title: "Code for Africa WanaData Fellowship 2026",
    organization: "Code for Africa (CfA)",
    type: "fellowship",
    description: "Stipend-based fellowships for African data journalists and data scientists. Supports fellows in producing data-driven stories and projects.",
    deadline: "2026-01-11T23:59:59Z",
    amount: "USD 250 per month stipend",
    location: "Africa",
    requirements: [
      "African data journalists and data scientists",
      "Portfolio of work"
    ],
    questions: [
      {
        id: "q1",
        question: "Describe a data-driven story or project you have produced. What data sources did you use, and what impact did your work have?",
        word_limit: 500,
        required: true
      },
      {
        id: "q2",
        question: "What data journalism or data science project would you pursue during this fellowship? Describe the story you want to tell and the data you would need.",
        word_limit: 400,
        required: true
      },
      {
        id: "q3",
        question: "How do you see data journalism contributing to transparency and accountability in Africa? Provide examples from your experience.",
        word_limit: 350,
        required: true
      }
    ],
    tags: ["africa", "data", "journalism", "technology"],
    is_public: true,
    status: "active",
    user_id: null
  }
]

export async function POST(request: Request) {
  try {
    // Verify admin key for security
    const { adminKey } = await request.json()

   if (adminKey !== process.env.ADMIN_SEED_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Insert all opportunities
    const { data, error } = await supabase
      .from("opportunities")
      .insert(opportunities)
      .select("id, title")

    if (error) {
      console.error("Insert error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully added ${data.length} opportunities`,
      opportunities: data
    })
  } catch (err) {
    console.error("Seed error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to seed opportunities" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "POST to this endpoint with a valid adminKey to seed the database",
    opportunityCount: opportunities.length
  })
}

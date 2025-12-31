"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { GraduationCap, Sparkles, Clock, FileCheck, Plus, ChevronRight, Zap, Calendar, Target } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { BottomNav } from "@/components/ui/bottom-nav"

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
}

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

// FAQ Data
const faqs = [
  {
    question: "How does Hont generate my scholarship essays?",
    answer: "Hont uses advanced AI (Claude) to analyze your profile and craft personalized, compelling essays tailored to each scholarship's specific questions and requirements. Every answer is unique to you."
  },
  {
    question: "How long does it take to generate an application?",
    answer: "Most applications are generated in 5-10 minutes. Our AI writes all your essays while you review and make final edits. What used to take 3+ hours now takes minutes."
  },
  {
    question: "Can I edit the AI-generated essays?",
    answer: "Absolutely! Every generated essay is fully editable. You can refine, regenerate, or completely rewrite any section. Think of it as a smart first draft that you perfect."
  },
  {
    question: "What types of opportunities are available?",
    answer: "We have 60+ scholarships, fellowships, grants, and exchange programs across multiple fields: STEM, Arts, Humanities, Public Service, International Study, and more. New opportunities added regularly."
  },
  {
    question: "Is my data secure and private?",
    answer: "Yes. Your profile, essays, and personal information are encrypted and never shared. We take data security seriously and comply with all privacy regulations."
  },
  {
    question: "Does Hont submit applications for me?",
    answer: "No. Hont generates your essays and helps you prepare, but you maintain full control. You review, approve, and submit applications yourself to the official scholarship websites."
  }
]

// Dynamic opportunities for hero
const opportunities = [
  "opportunity",
  "scholarship",
  "fellowship"
]

export default function LandingPage() {
  const [currentYear, setCurrentYear] = useState<number | null>(null)
  const [currentOpportunityIndex, setCurrentOpportunityIndex] = useState(0)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOpportunityIndex((prev) => (prev + 1) % opportunities.length)
    }, 3000) // 3 seconds display time
    return () => clearInterval(interval)
  }, [])

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <GraduationCap className="w-8 h-8 text-amber-500" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">Hont</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard/feed" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium transition-colors">
                Feed
              </Link>
              <Link href="/dashboard/applications" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium transition-colors">
                Applications
              </Link>
              <Link href="/dashboard/profile/edit" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium transition-colors">
                Profile
              </Link>
            </div>

            {/* Desktop CTA + Theme Toggle */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link
                href="/auth/signin"
                className="hidden md:block text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="hidden md:block bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
            Apply to your dream{" "}
            <span className="inline-block relative min-w-[180px] sm:min-w-[220px] text-left align-bottom">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentOpportunityIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent"
                >
                  {opportunities[currentOpportunityIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
            {" "}in minutes
          </h1>

          <motion.p
            className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Stop spending hours on application essays. Build one profile. Apply to hundreds. Secure your dream opportunity.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold py-4 px-8 rounded-xl text-lg transition-colors shadow-lg shadow-amber-500/25"
              >
                Build my profile
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="#how-it-works"
                className="w-full sm:w-auto inline-block bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold py-4 px-8 rounded-xl text-lg transition-colors border border-gray-200 dark:border-gray-700"
              >
                See How It Works
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <motion.section
        id="how-it-works"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900"
        {...fadeInUp}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How it works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Three steps to never repeat yourself again.
            </p>
          </div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <motion.div
              variants={staggerItem}
              className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 relative group hover:border-amber-500/50 transition-colors"
            >
              <div className="absolute -top-4 left-8 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-gray-900 font-bold text-sm">
                1
              </div>
              <motion.div
                className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-6 mt-2"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FileCheck className="w-6 h-6 text-amber-500" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Build your profile once</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Add your background, achievements, and goals. Upload a resume or fill it in manually.
              </p>
            </motion.div>

            <motion.div
              variants={staggerItem}
              className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 relative group hover:border-amber-500/50 transition-colors"
            >
              <div className="absolute -top-4 left-8 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-gray-900 font-bold text-sm">
                2
              </div>
              <motion.div
                className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-6 mt-2"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Sparkles className="w-6 h-6 text-amber-500" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Find opportunities</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Browse scholarships, grants, and fellowships matched to your profile and eligibility.
              </p>
            </motion.div>

            <motion.div
              variants={staggerItem}
              className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 relative group hover:border-amber-500/50 transition-colors"
            >
              <div className="absolute -top-4 left-8 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-gray-900 font-bold text-sm">
                3
              </div>
              <motion.div
                className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-6 mt-2"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Clock className="w-6 h-6 text-amber-500" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Apply in minutes</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our AI drafts tailored responses from your profile. Review, edit, and submit.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Why Hont Works Section */}
      <motion.section
        className="py-20 px-4 sm:px-6 lg:px-8"
        {...fadeInUp}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Hont Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Stop leaving opportunities on the table. Apply to everything that fits.
            </p>
          </div>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {/* Card 1: Time Savings */}
            <motion.div
              variants={staggerItem}
              className="bg-gray-800 dark:bg-gray-800 rounded-xl p-8 border border-gray-700 hover:bg-gray-700 dark:hover:bg-gray-700 transition-all group"
              whileHover={{ y: -5 }}
            >
              <motion.div
                className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center mb-6"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Zap className="w-7 h-7 text-amber-400" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">
                90% Faster Applications
              </h3>
              <p className="text-orange-500 text-lg font-medium mb-4">
                From Hours to Minutes
              </p>
              <p className="text-gray-400 text-base leading-relaxed">
                What used to take 3-4 hours now takes 10 minutes. Our AI handles the heavy lifting—extracting your profile, writing tailored essays, and respecting word limits—so you can apply to more opportunities in less time.
              </p>
            </motion.div>

            {/* Card 2: Deadline Management */}
            <motion.div
              variants={staggerItem}
              className="bg-gray-800 dark:bg-gray-800 rounded-xl p-8 border border-gray-700 hover:bg-gray-700 dark:hover:bg-gray-700 transition-all group"
              whileHover={{ y: -5 }}
            >
              <motion.div
                className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center mb-6"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Calendar className="w-7 h-7 text-amber-400" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Never Miss a Deadline
              </h3>
              <p className="text-orange-500 text-lg font-medium mb-4">
                AI-Powered Application Assistant
              </p>
              <p className="text-gray-400 text-base leading-relaxed">
                Hont writes your applications instantly, so you&apos;re never scrambling at the last minute. Track deadlines with smart badges, get notified when opportunities are closing soon, and submit with confidence.
              </p>
            </motion.div>

            {/* Card 3: Opportunity Maximization */}
            <motion.div
              variants={staggerItem}
              className="bg-gray-800 dark:bg-gray-800 rounded-xl p-8 border border-gray-700 hover:bg-gray-700 dark:hover:bg-gray-700 transition-all group"
              whileHover={{ y: -5 }}
            >
              <motion.div
                className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center mb-6"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Target className="w-7 h-7 text-amber-400" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">
                You Miss 100% of Shots You Don&apos;t Take
              </h3>
              <p className="text-orange-500 text-lg font-medium mb-4">
                Apply to Everything That Fits
              </p>
              <p className="text-gray-400 text-base leading-relaxed">
                Most people skip opportunities because applications are exhausting. With Hont, there&apos;s no excuse. Apply to 10, 20, or 50 scholarships—each one takes minutes, and each one is a chance to win.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950"
        {...fadeInUp}
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Everything you need to know about Hont
            </p>
          </div>

          <motion.div
            className="space-y-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={staggerItem}
                className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-amber-500/30 transition-colors"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-semibold text-gray-900 dark:text-white pr-4">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openFaqIndex === index ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0 w-8 h-8 bg-amber-500/10 rounded-full flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5 text-amber-500" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openFaqIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900"
        {...fadeInUp}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to transform your application journey?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Build your profile once. Apply to dozens of opportunities in minutes. Your future is waiting.
          </p>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold py-4 px-8 rounded-xl text-lg transition-colors shadow-lg shadow-amber-500/25"
            >
              Get Started Today
              <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-100 dark:border-gray-800 mb-16 md:mb-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <GraduationCap className="w-6 h-6 text-amber-500" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">Hont</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <Link href="#faq" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                FAQ
              </Link>
              <span>&copy; {currentYear || "2024"} Hont. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom Navigation for Mobile */}
      <BottomNav />
    </div>
  )
}

'use client'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Info, MailIcon, Github, Linkedin, Moon, Sun, Music, Music2 } from 'lucide-react'
import { useState, useEffect } from "react";
import { useAudio } from '@/contexts/AudioContext'

// Add this type for team members
type TeamMember = {
  name: string;
  role: string;
  contact: {
    email: string;
    github?: string;
    linkedin?: string;
  };
}

// Add this type for stakeholders
type Stakeholder = {
  name: string;
  role: string;
  organization: string;
}

export default function SettingsPage() {
  const [showTeamInfo, setShowTeamInfo] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { isPlaying, toggleAudio } = useAudio()

  // Initialize dark mode from localStorage on component mount
  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    document.documentElement.classList.toggle('dark');
  };

  // Developer information
  const developers: TeamMember[] = [
    {
      name: "Adrian Camota",
      role: "Lead Developer",
      contact: {
        email: "adriancamota@gmail.com",
        github: "https://github.com/adriancamota",
        linkedin: "https://www.linkedin.com/in/adrian-camota-3247b9306/"
      }
    },
    {
      name: "Anthony Villablanca",
      role: "Frontend Developer",
      contact: {
        email: "villablancaanthony2@gmail.com",
        github: "https://github.com/antunivillablnc",
        linkedin: "https://www.linkedin.com/in/anthony-villablanca-aa3536299/"
      }
    },
    {
      name: "Brian Neil Babasa",
      role: "Backend Developer",
      contact: {
        email: "brianneil238@gmail.com",
        github: "https://github.com/brianneil238",
        linkedin: "https://www.linkedin.com/in/brian-neil-babasa-134a5a315/"
      }
    }
  ];

  // Stakeholder information
  const stakeholders: Stakeholder[] = [
    {
      name: "Province of Batangas",
      role: "Local Government Unit",
      organization: "Clean Hero"
    },
    {
      name: "Department of Environment and Natural Resources",
      role: "Environmental Regulation",
      organization: "DENR Region 4A"
    },
    {
      name: "Local Community",
      role: "End Users",
      organization: "Clean up Volunteers"
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8 border-b border-green-200 dark:border-green-800 pb-4">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">Settings</h1>
      </div>
      
      <div className="space-y-6">
        {/* Appearance Card */}
        <Card className="p-4 border-green-100 dark:border-green-800 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Appearance</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Toggle between light and dark mode</p>
            </div>
            <Button
              onClick={toggleDarkMode}
              variant="outline"
              size="icon"
              className="h-10 w-10 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </Card>

        {/* Audio Card */}
        <Card className="p-4 border-green-100 dark:border-green-800 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Background Music</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Toggle background music on/off</p>
            </div>
            <Button
              onClick={toggleAudio}
              variant="outline"
              size="icon"
              className="h-10 w-10 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              {isPlaying ? (
                <Music2 className="h-5 w-5" />
              ) : (
                <Music className="h-5 w-5" />
              )}
            </Button>
          </div>
        </Card>
      </div>
      
      <div className="mt-8">
        <Button
          onClick={() => setShowTeamInfo(!showTeamInfo)}
          variant="outline"
          className="flex items-center gap-2 border-green-600 text-green-700 hover:bg-green-50 dark:border-green-500 dark:text-green-400 dark:hover:bg-gray-800"
        >
          <Info className="w-4 h-4" />
          {showTeamInfo ? 'Hide Team Information' : 'Show Team Information'}
        </Button>

        {showTeamInfo && (
          <div className="mt-4 space-y-6">
            {/* Developers Section */}
            <Card className="p-6 border-green-100 dark:border-green-800 shadow-lg hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 border-b border-green-200 dark:border-green-800 pb-2">
                Development Team
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {developers.map((dev, index) => (
                  <div key={index} className="p-6 rounded-lg border border-green-100 dark:border-green-800 bg-white dark:bg-gray-900 hover:bg-green-50 dark:hover:bg-gray-800 transition-colors duration-300">
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">{dev.name}</h3>
                    <p className="text-sm text-green-700 dark:text-green-400 mb-3">{dev.role}</p>
                    <div className="space-y-3 text-sm">
                      <a 
                        href={`mailto:${dev.contact.email}`} 
                        className="flex items-center gap-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:underline truncate"
                      >
                        <MailIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{dev.contact.email}</span>
                      </a>
                      {dev.contact.github && (
                        <a 
                          href={dev.contact.github} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:underline"
                        >
                          <Github className="w-4 h-4 flex-shrink-0" />
                          <span>GitHub Profile</span>
                        </a>
                      )}
                      {dev.contact.linkedin && (
                        <a 
                          href={dev.contact.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:underline"
                        >
                          <Linkedin className="w-4 h-4 flex-shrink-0" />
                          <span>LinkedIn Profile</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Stakeholders Section */}
            <Card className="p-6 border-green-100 dark:border-green-800 shadow-lg hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 border-b border-green-200 dark:border-green-800 pb-2">
                Stakeholders
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stakeholders.map((stakeholder, index) => (
                  <div key={index} className="p-4 rounded-lg border border-green-100 dark:border-green-800 bg-white dark:bg-gray-900 hover:bg-green-50 dark:hover:bg-gray-800 transition-colors duration-300">
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">{stakeholder.name}</h3>
                    <p className="text-sm text-green-700 dark:text-green-400">{stakeholder.role}</p>
                    <p className="text-sm text-green-600 dark:text-green-500">{stakeholder.organization}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 
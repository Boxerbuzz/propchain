import { Award, Briefcase, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const TeamSlide = () => {
  const team = [
    {
      name: "John Doe",
      role: "CEO & Co-Founder",
      initials: "JD",
      background: "15 years in PropTech, ex-Goldman Sachs",
      icon: Briefcase,
    },
    {
      name: "Jane Smith",
      role: "CTO & Co-Founder",
      initials: "JS",
      background: "Blockchain architect, ex-Google",
      icon: GraduationCap,
    },
    {
      name: "Mike Johnson",
      role: "Head of Operations",
      initials: "MJ",
      background: "Real estate veteran, 20+ years experience",
      icon: Award,
    },
    {
      name: "Sarah Williams",
      role: "Head of Legal & Compliance",
      initials: "SW",
      background: "Securities lawyer, ex-SEC",
      icon: Award,
    },
  ];

  const advisors = [
    "Dr. Alex Brown - Blockchain Expert, MIT",
    "Lisa Chen - Real Estate Investment Advisor",
    "David Kumar - FinTech Strategy Consultant",
  ];

  return (
    <div className="flex flex-col h-full p-12">
      <div className="mb-8">
        <h2 className="text-4xl font-bold mb-3">Our Team</h2>
        <p className="text-lg text-muted-foreground">
          Experienced leaders combining real estate, blockchain, and finance expertise
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {team.map((member, index) => (
          <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-sm text-primary font-medium mb-2">{member.role}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <member.icon className="h-4 w-4" />
                    <span>{member.background}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-2 bg-gradient-to-br from-primary/5 to-card">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            Advisory Board
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {advisors.map((advisor, index) => (
              <div key={index} className="text-sm">
                <p className="font-medium">{advisor.split(" - ")[0]}</p>
                <p className="text-muted-foreground">{advisor.split(" - ")[1]}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>Combined 50+ years of experience in PropTech, Blockchain & Finance</p>
      </div>
    </div>
  );
};

export default TeamSlide;

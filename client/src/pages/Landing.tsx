import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function Landing() {
  const [, setLocation] = useLocation();

  const features = [
    { icon: "🎯", title: "Личный путь", desc: "AI создаст индивидуальный план развития" },
    { icon: "🎓", title: "Топ курсы", desc: "Лучшие возможности для портфолио" },
    { icon: "🏆", title: "Олимпиады", desc: "Участвуй и выигрывай стипендии" },
    { icon: "👥", title: "Менторство", desc: "Поддержка от профессионалов" }
  ];

  return (
    <div className="min-h-screen">
      <nav className="fixed w-full z-50 top-0 px-6 py-4">
        <div className="glass max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-gradient">Portfol.IO</h1>
            <div className="hidden md:flex space-x-6">
              {["О нас", "Курсы", "Стажировки", "Менторы"].map(item => (
                <a key={item} className="text-sm text-white/70 hover:text-white transition-colors">{item}</a>
              ))}
            </div>
          </div>
          <Button onClick={() => setLocation("/login")} className="glow glass">
            Войти
          </Button>
        </div>
      </nav>

      <main className="pt-32 px-6">
        <motion.section 
          className="max-w-7xl mx-auto text-center"
          initial="initial"
          animate="animate"
          variants={staggerChildren}
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 text-gradient leading-tight"
            variants={fadeIn}
          >
            Построй свое будущее<br />с Portfol.IO
          </motion.h1>
          <motion.p 
            className="text-xl text-white/60 mb-12 max-w-2xl mx-auto"
            variants={fadeIn}
          >
            Платформа нового поколения для развития твоей карьеры. Курсы, стажировки и менторство в одном месте.
          </motion.p>

          <motion.div 
            className="flex flex-wrap justify-center gap-4 mb-20"
            variants={fadeIn}
          >
            <Button 
              className="glow bg-gradient-to-r from-[#4A90E2] to-[#87CEEB] text-lg py-6 px-8"
              onClick={() => setLocation("/register")}
            >
              Начать бесплатно
            </Button>
            <Button 
              className="glow glass text-lg py-6 px-8"
              variant="outline"
            >
              Узнать больше
            </Button>
          </motion.div>

          <motion.div 
            className="hero-grid"
            variants={fadeIn}
          >
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                className="glass p-6 text-center animate-float"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/60">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      </main>
    </div>
  );
}
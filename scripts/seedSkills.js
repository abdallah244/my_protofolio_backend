const mongoose = require('mongoose');
const Skill = require('../src/models/Skill.model');
require('dotenv').config();

const seedSkills = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // حذف المهارات الموجودة
    await Skill.deleteMany();
    console.log('Deleted existing skills');

    // إضافة مهارات جديدة
    const skills = [
      {
        name: 'Angular',
        icon: 'fab fa-angular',
        level: 90,
        category: 'frontend',
        order: 1,
        isActive: true
      },
      {
        name: 'React',
        icon: 'fab fa-react',
        level: 85,
        category: 'frontend',
        order: 2,
        isActive: true
      },
      {
        name: 'Node.js',
        icon: 'fab fa-node-js',
        level: 88,
        category: 'backend',
        order: 3,
        isActive: true
      },
      {
        name: 'TypeScript',
        icon: 'fas fa-code',
        level: 92,
        category: 'language',
        order: 4,
        isActive: true
      },
      {
        name: 'MongoDB',
        icon: 'fas fa-database',
        level: 80,
        category: 'database',
        order: 5,
        isActive: true
      },
      {
        name: 'PostgreSQL',
        icon: 'fas fa-database',
        level: 75,
        category: 'database',
        order: 6,
        isActive: true
      },
      {
        name: 'Express.js',
        icon: 'fas fa-server',
        level: 85,
        category: 'backend',
        order: 7,
        isActive: true
      },
      {
        name: 'JavaScript',
        icon: 'fab fa-js-square',
        level: 95,
        category: 'language',
        order: 8,
        isActive: true
      }
    ];

    await Skill.insertMany(skills);
    console.log('Skills seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding skills:', error);
    process.exit(1);
  }
};

seedSkills();
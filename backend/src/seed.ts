import { Developer, Skill, Task, DeveloperSkill, TaskSkill, sequelize } from './models';
import { TaskStatus } from './models/Task';

async function seed() {
  try {
    console.log('Starting database seed...');

    // Connect to database
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Create Skills
    const frontend = await Skill.create({ name: 'Frontend' });
    const backend = await Skill.create({ name: 'Backend' });
    console.log('Created skills:', { frontend: frontend.name, backend: backend.name });

    // Create Developers
    const alice = await Developer.create({ name: 'Alice' });
    const bob = await Developer.create({ name: 'Bob' });
    const carol = await Developer.create({ name: 'Carol' });
    const dave = await Developer.create({ name: 'Dave' });
    console.log('Created developers:', { alice: alice.name, bob: bob.name, carol: carol.name, dave: dave.name });

    // Assign skills to developers
    await DeveloperSkill.create({ developerId: alice.id, skillId: frontend.id });
    await DeveloperSkill.create({ developerId: bob.id, skillId: backend.id });
    await DeveloperSkill.create({ developerId: carol.id, skillId: frontend.id });
    await DeveloperSkill.create({ developerId: carol.id, skillId: backend.id });
    await DeveloperSkill.create({ developerId: dave.id, skillId: backend.id });
    console.log('Assigned skills to developers.');

    // Create sample tasks
    const task1 = await Task.create({
      title: 'As a visitor, I want to see a responsive homepage so that I can easily navigate on both desktop and mobile devices.',
      status: TaskStatus.TODO,
    });
    await TaskSkill.create({ taskId: task1.id, skillId: frontend.id });

    const task2 = await Task.create({
      title: 'As a system administrator, I want audit logs of all data access and modifications so that I can ensure compliance with data protection regulations and investigate any security incidents.',
      status: TaskStatus.TODO,
    });
    await TaskSkill.create({ taskId: task2.id, skillId: backend.id });

    const task3 = await Task.create({
      title: 'As a logged-in user, I want to update my profile information and upload a profile picture so that my account details are accurate and personalized.',
      status: TaskStatus.TODO,
    });
    await TaskSkill.create({ taskId: task3.id, skillId: frontend.id });
    await TaskSkill.create({ taskId: task3.id, skillId: backend.id });

    console.log('Created sample tasks.');

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();

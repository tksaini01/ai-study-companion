import { StudyNote, MCQQuiz, FlashcardDeck, TopicExplanation, QuizAttempt } from './types';

export const SAMPLE_NOTES: StudyNote[] = [
  {
    id: 'note-cs-os',
    title: 'Operating Systems: Concurrency, Deadlocks & Memory Management',
    fileName: 'CS301_Operating_Systems_Lecture4.pdf',
    fileSize: 420000,
    wordCount: 1420,
    pageCount: 8,
    tags: ['Computer Science', 'Operating Systems', 'Concurrency', 'Memory'],
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
    summary: 'Comprehensive review of process synchronization, mutual exclusion primitives (semaphores, mutexes), the four Coffman conditions for deadlocks, Banker algorithm for deadlock avoidance, and virtual memory paging with page fault handling.',
    content: `OPERATING SYSTEMS & CONCURRENCY CONCEPTS

1. PROCESS SYNCHRONIZATION & CRITICAL SECTIONS
In multitasking systems, concurrent processes or threads share resources such as memory, files, and I/O devices. When multiple threads manipulate shared data concurrently and the outcome depends on execution order, a race condition occurs.
To prevent race conditions, concurrent access must be synchronized using the Critical Section Problem framework:
- Mutual Exclusion: Only one process can execute in its critical section at any given time.
- Progress: If no process is in its critical section and some wish to enter, selection cannot be postponed indefinitely.
- Bounded Waiting: A bound must exist on the number of times other processes are allowed to enter their critical sections after a process has requested entry.

Synchronization Primitives:
- Mutex Locks: Binary flag providing mutual exclusion. A thread acquires the lock before entering critical section and releases upon exit.
- Semaphores: Integer variable manipulated via wait() [P] and signal() [V] atomic operations. Counting semaphores control access to a finite pool of resources; binary semaphores behave like mutexes.
- Monitors: High-level language construct that encapsulates shared data, procedures, and condition variables (wait and signal) ensuring mutual exclusion automatically.

2. DEADLOCKS & THE COFFMAN CONDITIONS
A deadlock occurs when a set of concurrent processes are blocked because each process is holding a resource and waiting for another resource acquired by some other process in the set.
Four Coffman Conditions (Must all hold simultaneously for a deadlock):
1. Mutual Exclusion: At least one resource must be held in a non-shareable mode.
2. Hold and Wait: A process must be holding at least one resource and waiting to acquire additional resources held by other processes.
3. No Preemption: Resources cannot be preempted; a resource can be released only voluntarily by the process holding it after completing its task.
4. Circular Wait: A closed chain of processes exists such that each process holds at least one resource needed by the next process in the chain (P0 waits for P1, P1 waits for P2... Pn waits for P0).

Deadlock Handling Strategies:
- Prevention: Invalidate at least one of the four Coffman conditions (e.g., impose resource ordering to eliminate circular wait).
- Avoidance: Ensure system never enters an unsafe state. The Banker's Algorithm dynamically inspects resource allocation states using Max, Allocation, Need, and Available vectors.
- Detection & Recovery: Allow deadlocks to occur, periodically invoke a resource-allocation graph cycle detection algorithm, and recover by process termination or resource preemption.
- Ignorance (Ostrich Algorithm): Pretend deadlocks never occur; common in general-purpose desktop operating systems.

3. VIRTUAL MEMORY & PAGING
Virtual memory decouples the logical address space from physical memory (RAM).
- Page: Fixed-size block of logical memory.
- Frame: Fixed-size block of physical RAM.
- Page Table: Maps logical pages to physical frames, containing valid-invalid protection bits.
- Translation Lookaside Buffer (TLB): High-speed associative hardware cache holding recent page-to-frame translations. If TLB hit occurs, translation takes ~1ns; if TLB miss, page table in memory is queried.
- Page Fault: Trap raised by memory management unit (MMU) when an accessed page is not resident in physical RAM. The OS fetches the required page from swap disk into a free frame, updates the page table, and restarts the instruction.
- Page Replacement Algorithms: FIFO, Optimal (MIN), and Least Recently Used (LRU) using timestamps or reference counters.`
  },
  {
    id: 'note-bio-atp',
    title: 'Cellular Respiration, Glycolysis & Mitochondrial ATP Synthesis',
    fileName: 'BIO102_Cell_Metabolism_Chapter9.pdf',
    fileSize: 310000,
    wordCount: 1250,
    pageCount: 6,
    tags: ['Biology', 'Biochemistry', 'Cellular Respiration', 'Metabolism'],
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 3,
    summary: 'Detailed overview of eukaryotic energy harvesting via aerobic cellular respiration: glycolysis in cytoplasm, pyruvate oxidation and Krebs cycle in mitochondrial matrix, electron transport chain complexes, and chemiosmosis via ATP synthase.',
    content: `CELLULAR RESPIRATION & BIOENERGETICS

1. OVERVIEW OF AEROBIC RESPIRATION
Cellular respiration is the catabolic pathway by which organic molecules (primarily glucose C6H12O6) are broken down to generate adenosine triphosphate (ATP), the universal cellular energy currency.
Overall chemical reaction:
C6H12O6 + 6 O2 -> 6 CO2 + 6 H2O + ~30-32 ATP (delta G = -686 kcal/mol)

Four Major Stages:
1. Glycolysis (Cytoplasm / Cytosol)
2. Pyruvate Oxidation / Link Reaction (Mitochondrial Matrix)
3. Citric Acid Cycle / Krebs Cycle (Mitochondrial Matrix)
4. Oxidative Phosphorylation & Chemiosmosis (Inner Mitochondrial Membrane)

2. GLYCOLYSIS
Occurs anaerobically in the cytosol.
- Energy Investment Phase: 2 ATP are consumed to phosphorylate glucose into Fructose-1,6-bisphosphate (rate-limiting enzyme: Phosphofructokinase-1).
- Cleavage: Fructose-1,6-bisphosphate is cleaved into two 3-carbon isomers: G3P (Glyceraldehyde-3-phosphate) and DHAP.
- Energy Payoff Phase: 4 ATP generated via substrate-level phosphorylation; 2 NAD+ reduced to 2 NADH; net yield = 2 ATP, 2 NADH, and 2 Pyruvate molecules per glucose.

3. THE CITRIC ACID CYCLE (KREBS CYCLE)
Each pyruvate enters the mitochondrion and undergoes oxidative decarboxylation catalyzed by Pyruvate Dehydrogenase, yielding Acetyl-CoA, 1 CO2, and 1 NADH.
Acetyl-CoA (2C) joins Oxaloacetate (4C) to form Citrate (6C).
Through an eight-step cycle, per turn (2 turns per glucose):
- 2 CO2 released as waste
- 3 NADH and 1 FADH2 generated (high-energy electron carriers)
- 1 GTP (or ATP) generated via substrate-level phosphorylation
Total for 1 glucose: 4 CO2, 6 NADH, 2 FADH2, 2 ATP.

4. OXIDATIVE PHOSPHORYLATION & CHEMIOSMOSIS
The electron transport chain (ETC) consists of multiprotein complexes (I, II, III, IV) embedded in the inner mitochondrial cristae.
- NADH donates electrons to Complex I; FADH2 donates to Complex II.
- As electrons transfer sequentially through ubiquinone (CoQ), Complex III, cytochrome c, and Complex IV to the terminal electron acceptor O2 (forming H2O), protons (H+) are pumped across the inner membrane from the matrix to the intermembrane space.
- This creates an electrochemical proton gradient (Proton-Motive Force).
- Chemiosmosis: H+ ions flow down their electrochemical gradient back into matrix through ATP Synthase (rotary motor enzyme), driving phosphorylation of ADP + Pi -> ATP.`
  },
  {
    id: 'note-hist-coldwar',
    title: 'The Cold War: Geopolitics, Deterrence & Superpower Rivalry',
    fileName: 'HIST204_Cold_War_Era_Notes.pdf',
    fileSize: 280000,
    wordCount: 1100,
    pageCount: 5,
    tags: ['History', 'Geopolitics', 'Cold War', 'International Relations'],
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 86400000 * 6,
    summary: 'Analysis of post-WWII geopolitical polarization between the US and USSR, Truman Doctrine, Marshall Plan, NATO and Warsaw Pact, proxy conflicts (Korea, Vietnam, Cuban Missile Crisis), and eventual dissolution of the Soviet bloc.',
    content: `THE COLD WAR: 1945 - 1991

1. ORIGINS & IDEOLOGICAL SPLIT
Following the defeat of the Axis powers in 1945, the Grand Alliance fractured. The United States (democratic capitalism) and the Soviet Union (authoritarian Marxist-Leninist communism) emerged as rival superpowers with incompatible ideological, geopolitical, and economic goals.
Key early catalysts:
- Yalta and Potsdam Conferences (1945): Disagreements over Polish borders and democratic self-determination in Eastern Europe.
- Churchill's "Iron Curtain" Speech (1946): Warning of Soviet domination across Central and Eastern Europe.
- George Kennan's "Long Telegram" (1946): Articulated the policy of Containment to prevent further Soviet expansion.

2. CONTAINMENT DOCTRINE & ECONOMIC RECONSTRUCTION
- Truman Doctrine (1947): Declared US commitment to support free peoples resisting subjugation by armed minorities or outside pressures (specifically military and financial aid to Greece and Turkey).
- Marshall Plan (European Recovery Program, 1948): Provided over $13 billion in economic assistance to rebuild Western European infrastructure and economies, blunting communist electoral appeal.
- Berlin Blockade & Airlift (1948-1949): Stalin blockaded ground access to West Berlin; Western Allies delivered supplies by air for 11 months until the blockade was lifted.

3. MILITARY BLOCS & NUCLEAR DETERRENCE
- NATO (North Atlantic Treaty Organization, 1949): Collective defense alliance anchored by Article 5 ("an attack against one is an attack against all").
- Warsaw Pact (1955): Soviet-led military counterpart binding Eastern European satellite states.
- Mutually Assured Destruction (MAD): Both powers accumulated thermonuclear arsenals, creating a stalemate where a first strike would guarantee total retaliatory destruction.

4. MAJOR PROXY CONFLICTS & DETENTE
Because direct conflict risked nuclear annihilation, superpowers engaged through proxy wars:
- Korean War (1950-1953): North Korea backed by USSR/China invaded South Korea backed by UN/US coalition; concluded with armistice at 38th parallel.
- Cuban Missile Crisis (October 1962): Closest confrontation to nuclear war after Soviet ballistic missiles were deployed to Cuba; resolved via naval quarantine and mutual missile removals.
- Vietnam War (1955-1975) & Soviet-Afghan War (1979-1989).
- Collapse of the USSR (1989-1991): Gorbachev's policies of Glasnost (openness) and Perestroika (restructuring) inadvertently accelerated nationalist movements, leading to the fall of the Berlin Wall in 1989 and dissolution of the USSR in December 1991.`
  }
];

export const SAMPLE_QUIZZES: MCQQuiz[] = [
  {
    id: 'quiz-cs-os-1',
    noteId: 'note-cs-os',
    noteTitle: 'Operating Systems: Concurrency & Deadlocks',
    title: 'Operating Systems Mastery Quiz: Concurrency & Deadlocks',
    difficulty: 'medium',
    timeLimitMinutes: 10,
    createdAt: Date.now() - 86400000,
    questions: [
      {
        id: 'q1',
        question: 'Which of the following is NOT one of the four Coffman conditions necessary for a deadlock to occur?',
        options: [
          'Mutual Exclusion',
          'Hold and Wait',
          'Preemptive Resource Allocation',
          'Circular Wait'
        ],
        correctIndex: 2,
        explanation: 'The four Coffman conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Preemptive resource allocation actually PREVENTS deadlocks because resources can be forcibly reclaimed.',
        hint: 'Think about whether allowing the OS to forcibly take resources away causes deadlocks or prevents them.',
        topic: 'Deadlocks'
      },
      {
        id: 'q2',
        question: 'What is the primary function of the Translation Lookaside Buffer (TLB)?',
        options: [
          'Store virtual page frames on disk during swapping',
          'Act as a high-speed hardware cache for page-to-frame translations',
          'Prevent race conditions between threads executing in critical sections',
          'Check for circular dependencies in the resource-allocation graph'
        ],
        correctIndex: 1,
        explanation: 'The TLB is an associative hardware cache in the MMU that stores recent virtual-to-physical address mappings, reducing memory access latency from two memory references to one on a TLB hit.',
        hint: 'It is a small, associative memory cache located inside or near the MMU.',
        topic: 'Memory Management'
      },
      {
        id: 'q3',
        question: 'In the Critical Section Problem, what does the "Bounded Waiting" requirement guarantee?',
        options: [
          'A thread cannot wait forever to enter its critical section after making a request',
          'Only one thread is allowed to access CPU registers concurrently',
          'Processes must complete their critical section within a fixed number of milliseconds',
          'The CPU clock frequency must remain bounded during process execution'
        ],
        correctIndex: 0,
        explanation: 'Bounded waiting ensures that a limit exists on the number of times other processes can enter their critical sections after a process has requested entry, eliminating the possibility of starvation.',
        hint: 'Focus on starvation prevention rather than real-time clock execution limits.',
        topic: 'Process Synchronization'
      },
      {
        id: 'q4',
        question: 'The Banker’s Algorithm is categorized under which deadlock strategy?',
        options: [
          'Deadlock Prevention',
          'Deadlock Avoidance',
          'Deadlock Detection and Recovery',
          'Deadlock Ignorance (Ostrich Algorithm)'
        ],
        correctIndex: 1,
        explanation: 'The Banker’s Algorithm is a Deadlock Avoidance algorithm that evaluates maximum resource claims and current availability to determine if granting a request leaves the system in a "safe state".',
        hint: 'It ensures the system never transitions into an unsafe state.',
        topic: 'Deadlocks'
      },
      {
        id: 'q5',
        question: 'When a process accesses a logical page that is not currently mapped into physical RAM, what hardware event is triggered?',
        options: [
          'Segmentation Fault trap',
          'Page Fault interrupt/trap',
          'Bus Error exception',
          'Stack Overflow exception'
        ],
        correctIndex: 1,
        explanation: 'A Page Fault occurs when the valid-invalid bit in the page table indicates the page is not in physical RAM. The OS page fault handler then swaps the page in from secondary storage.',
        hint: 'The term specifically references pages in virtual memory.',
        topic: 'Virtual Memory'
      }
    ]
  },
  {
    id: 'quiz-bio-atp-1',
    noteId: 'note-bio-atp',
    noteTitle: 'Cellular Respiration, Glycolysis & Mitochondrial ATP Synthesis',
    title: 'Cellular Respiration & Bioenergetics Assessment',
    difficulty: 'medium',
    timeLimitMinutes: 8,
    createdAt: Date.now() - 86400000 * 2,
    questions: [
      {
        id: 'bq1',
        question: 'Where does glycolysis take place inside a eukaryotic cell?',
        options: [
          'Mitochondrial matrix',
          'Inner mitochondrial membrane cristae',
          'Cytosol (cytoplasm)',
          'Endoplasmic reticulum lumen'
        ],
        correctIndex: 2,
        explanation: 'Glycolysis is an ancient metabolic pathway that occurs entirely in the cytosol of the cell and does not require oxygen or membrane-bound organelles.',
        hint: 'It does not require any organelle.',
        topic: 'Glycolysis'
      },
      {
        id: 'bq2',
        question: 'During oxidative phosphorylation, what directly powers the synthesis of ATP by ATP Synthase?',
        options: [
          'Direct hydrolysis of glucose molecules',
          'The flow of protons (H+) down their electrochemical gradient (chemiosmosis)',
          'Active transport of sodium and potassium ions across the cristae',
          'The cleavage of pyruvate into Acetyl-CoA'
        ],
        correctIndex: 1,
        explanation: 'ATP Synthase functions like a molecular rotary turbine driven by the proton-motive force (H+ gradient) established across the inner mitochondrial membrane by the electron transport chain.',
        hint: 'Think about chemiosmosis and the proton gradient.',
        topic: 'Oxidative Phosphorylation'
      },
      {
        id: 'bq3',
        question: 'What is the terminal electron acceptor in the mitochondrial electron transport chain during aerobic respiration?',
        options: [
          'NAD+',
          'Oxygen (O2)',
          'Pyruvate',
          'Carbon Dioxide (CO2)'
        ],
        correctIndex: 1,
        explanation: 'Molecular oxygen (O2) is the final electron acceptor at Complex IV (cytochrome c oxidase), where it combines with electrons and protons to form metabolic water (H2O).',
        hint: 'Why do aerobic organisms breathe this molecule in?',
        topic: 'Electron Transport Chain'
      }
    ]
  }
];

export const SAMPLE_FLASHCARD_DECKS: FlashcardDeck[] = [
  {
    id: 'deck-cs-os',
    noteId: 'note-cs-os',
    noteTitle: 'Operating Systems: Concurrency & Deadlocks',
    title: 'OS Key Terms & Concurrency Deck',
    createdAt: Date.now() - 86400000,
    cards: [
      {
        id: 'fc-1',
        noteId: 'note-cs-os',
        front: 'What is a Race Condition?',
        back: 'A situation where multiple concurrent threads or processes access and manipulate shared data, and the final outcome depends on the non-deterministic order or timing of execution.',
        hint: 'Shared data + concurrent execution order',
        topic: 'Concurrency',
        mastery: 'mastered',
        reviewCount: 3,
        lastReviewed: Date.now() - 3600000
      },
      {
        id: 'fc-2',
        noteId: 'note-cs-os',
        front: 'List the Four Coffman Conditions for Deadlock',
        back: '1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait\nAll four must hold simultaneously for a deadlock to occur.',
        hint: 'M-H-N-C mnemonic',
        topic: 'Deadlocks',
        mastery: 'learning',
        reviewCount: 2,
        lastReviewed: Date.now() - 14400000
      },
      {
        id: 'fc-3',
        noteId: 'note-cs-os',
        front: 'What is the Difference Between Mutex and Counting Semaphore?',
        back: 'A Mutex is a locking mechanism with ownership (only the thread that locked it can unlock it) with state 0 or 1. A Counting Semaphore is a signaling mechanism with an integer counter (controls access to N instances of a resource).',
        hint: 'Ownership vs integer resource counter',
        topic: 'Synchronization Primitives',
        mastery: 'mastered',
        reviewCount: 4,
        lastReviewed: Date.now() - 7200000
      },
      {
        id: 'fc-4',
        noteId: 'note-cs-os',
        front: 'What is a Page Fault and how does the OS handle it?',
        back: 'A trap triggered when a process requests a page not present in RAM (valid bit = 0). The OS suspends the process, fetches the page from swap space into a physical frame, updates the page table, and restarts the instruction.',
        hint: 'Valid/invalid bit + disk swap fetch',
        topic: 'Virtual Memory',
        mastery: 'new',
        reviewCount: 0
      },
      {
        id: 'fc-5',
        noteId: 'note-cs-os',
        front: 'What is Belady\'s Anomaly in Paging?',
        back: 'The phenomenon in FIFO page replacement where increasing the number of allocated physical page frames paradoxically results in MORE page faults rather than fewer.',
        hint: 'More memory frames -> more page faults (FIFO)',
        topic: 'Virtual Memory',
        mastery: 'learning',
        reviewCount: 1,
        lastReviewed: Date.now() - 28800000
      }
    ]
  },
  {
    id: 'deck-bio-atp',
    noteId: 'note-bio-atp',
    noteTitle: 'Cellular Respiration, Glycolysis & Mitochondrial ATP Synthesis',
    title: 'Cellular Respiration High-Yield Flashcards',
    createdAt: Date.now() - 86400000 * 3,
    cards: [
      {
        id: 'fc-bio-1',
        noteId: 'note-bio-atp',
        front: 'What is the Net ATP and NADH Yield of Glycolysis per Glucose?',
        back: 'Net Yield:\n- 2 ATP (4 generated - 2 invested)\n- 2 NADH\n- 2 Pyruvate molecules',
        hint: 'Invest 2, generate 4',
        topic: 'Glycolysis',
        mastery: 'mastered',
        reviewCount: 5,
        lastReviewed: Date.now() - 10000000
      },
      {
        id: 'fc-bio-2',
        noteId: 'note-bio-atp',
        front: 'Explain Chemiosmosis and the Proton-Motive Force',
        back: 'The process where energy stored in an electrochemical gradient of H+ ions across the inner mitochondrial membrane powers ATP synthesis as protons pass back through ATP Synthase.',
        hint: 'H+ gradient + ATP Synthase turbine',
        topic: 'Chemiosmosis',
        mastery: 'learning',
        reviewCount: 2,
        lastReviewed: Date.now() - 20000000
      }
    ]
  }
];

export const SAMPLE_EXPLANATIONS: TopicExplanation[] = [
  {
    id: 'exp-cs-deadlocks',
    noteId: 'note-cs-os',
    noteTitle: 'Operating Systems: Concurrency, Deadlocks & Memory Management',
    topic: 'Deadlock Handling & The Coffman Conditions',
    overview: 'A deadlock is a permanent state where a group of concurrent processes cannot proceed because each is waiting for a resource held by another member in the group. In modern computing systems, deadlocks degrade system throughput and require systematic prevention, avoidance, or detection algorithms.',
    keyTakeaways: [
      'Four conditions must exist simultaneously: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.',
      'Eliminating any single Coffman condition renders deadlock mathematically impossible.',
      'Banker’s Algorithm provides dynamic avoidance by checking safe states before granting requests.',
      'Cycle detection in a Resource-Allocation Graph confirms deadlocks in single-instance resource systems.'
    ],
    eli5: 'Imagine 4 children sitting at a round dinner table. Each child has a bowl of soup that requires two spoons to eat, but there is only 1 spoon between each pair of bowls (4 spoons total). If every child simultaneously picks up the spoon on their right and waits for the spoon on their left to be set down, nobody can eat and nobody will put their spoon down. They are starved in a deadlock!',
    mnemonics: [
      '**M-H-N-C**: **M**utual exclusion, **H**old & wait, **N**o preemption, **C**ircular wait (Remember: "Most Heroes Need Coffee")'
    ],
    keyTerms: [
      {
        term: 'Coffman Conditions',
        definition: 'The four necessary and sufficient criteria for a system deadlock.',
        context: 'Devised by Edward G. Coffman Jr. in 1971.'
      },
      {
        term: 'Safe State',
        definition: 'A state where there exists at least one sequence of process executions that allows all processes to finish without deadlocking.',
        context: 'Core concept of the Banker’s Algorithm.'
      },
      {
        term: 'Resource-Allocation Graph (RAG)',
        definition: 'A directed graph where vertices represent processes and resources, and directed edges represent requests and assignments.',
        context: 'A cycle in a RAG indicates deadlock if every resource type has exactly one instance.'
      }
    ],
    practiceQuestions: [
      {
        question: 'How can an operating system break the "Circular Wait" condition in practice?',
        answer: 'By imposing a strict numerical ordering on all resource types and requiring that processes always request resources in strictly ascending numerical order.',
        explanation: 'If a process holds resource R_i, it can only request resource R_j where j > i. This mathematical constraint prevents any directed cycles from ever forming.'
      },
      {
        question: 'Why does the Ostrich Algorithm remain popular in general-purpose operating systems like Windows and Linux?',
        answer: 'Because deadlocks occur infrequently in typical user workloads, and the CPU/memory overhead of continuous avoidance or graph cycle detection would severely penalize general performance.',
        explanation: 'System designers balance safety against runtime overhead; rare deadlocks are resolved via reboot or user force-close.'
      }
    ],
    createdAt: Date.now() - 86400000
  }
];

export const SAMPLE_ATTEMPTS: QuizAttempt[] = [
  {
    id: 'att-1',
    quizId: 'quiz-cs-os-1',
    quizTitle: 'Operating Systems Mastery Quiz: Concurrency & Deadlocks',
    noteId: 'note-cs-os',
    score: 4,
    totalQuestions: 5,
    percentage: 80,
    date: Date.now() - 86400000,
    userAnswers: { q1: 2, q2: 1, q3: 0, q4: 1, q5: 0 },
    timeSpentSeconds: 145
  },
  {
    id: 'att-2',
    quizId: 'quiz-bio-atp-1',
    quizTitle: 'Cellular Respiration & Bioenergetics Assessment',
    noteId: 'note-bio-atp',
    score: 3,
    totalQuestions: 3,
    percentage: 100,
    date: Date.now() - 86400000 * 2,
    userAnswers: { bq1: 2, bq2: 1, bq3: 1 },
    timeSpentSeconds: 88
  }
];

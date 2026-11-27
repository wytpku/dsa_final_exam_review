(() => {
  const addChapter = (chapter, title, questions) => {
    const number = String(chapter).padStart(2, "0");
    window.DSA_PAPERS.push({
      id: `hw-2022-${number}`,
      kind: "homework",
      archive: true,
      label: `2022 秋 · 第 ${chapter} 章`,
      sourceName: `${number}_${title}.pdf`,
      details: `北大数算 A 2022 秋季书面作业 · ${title}`,
      questions,
    });
  };

  const recovered = "存档保留的是手写解答。题设按解答中可辨认的条件整理。";

  addChapter(1, "复杂度", [
    {
      ref: "1", page: 1, title: "按赋值次数分析嵌套循环",
      topics: ["complexity", "arrays"], note: recovered,
      prompt: [
        "设 n≥1，并执行下列两层循环。分别数出 i、j 与数组元素的赋值次数，再求三者之和以及渐近复杂度。循环变量初始化和每次自增各算一次赋值。",
        "",
        "for (i = 1; i < n; i++)",
        "    for (j = i; j <= n; j++)",
        "        a[i][j] = 0;",
      ].join("\n"),
      model: "外层循环变量 i 被赋值 n 次。固定第 i 趟，j 被赋值 n−i+2 次，a[i][j] 被赋值 n−i+1 次。三者之和是 n+∑(i=1…n−1)(2n−2i+3)=n²+3n−3，因而是 Θ(n²)。",
    },
    {
      ref: "2(1)", page: 1, title: "从比值极限推断增长阶",
      topics: ["complexity"],
      note: "存档仅保留最终的比值极限，原题中 T(n) 的具体表达式未保留。",
      prompt: "已知 lim(n→∞) T(n)/n² = 1。说明 T(n)=O(n³) 是否成立，并给出 T(n) 的紧确 Θ 阶。",
      model: "由极限定义，当 n 足够大时，n²/2 ≤ T(n) ≤ 3n²/2。因此 T(n)=Θ(n²)。又因为 n²≤n³（n≥1），T(n)=O(n³) 也成立。",
    },
    {
      ref: "2(2)", page: 1, title: "带常数项的指数递推",
      topics: ["complexity", "recursion"], note: recovered,
      prompt: "设 T(1)=1，T(n)=2T(n−1)+1（n≥2）。求通项，验证它满足递推，并给出时间复杂度的 Θ 表示。",
      model: "令 U(n)=T(n)+1，则 U(1)=2 且 U(n)=2U(n−1)，所以 T(n)=2ⁿ−1。代入验证 T(1)=1 与 2(2ⁿ⁻¹−1)+1=2ⁿ−1，故 T(n)=Θ(2ⁿ)。",
    },
    {
      ref: "3(1)", page: 1, title: "最大值与和的渐近等价",
      topics: ["complexity"], note: recovered,
      prompt: "设 f(n)、g(n) 均为非负函数。证明 max(f(n),g(n))=Θ(f(n)+g(n))。",
      model: "逐点都有 (f(n)+g(n))/2 ≤ max(f(n),g(n)) ≤ f(n)+g(n)。按 Θ 定义，常数分别取 1/2、1 即可。",
    },
  ]);

  addChapter(2, "线性表", [
    {
      ref: "1", page: 1, title: "原地去重有序顺序表",
      topics: ["arrays", "algorithm-design"], note: recovered,
      prompt: "给定非降序数组 a，要求就地删除重复值，每个不同关键字只保留一次，并维持原有次序。设计 O(n) 时间、O(1) 额外空间的算法并返回新长度。",
      model: "令 write=0。从左到右扫描每个 x，若 write==0 或 a[write−1]≠x，就把 x 写入 a[write] 并令 write++。排序保证相等值连在一起，故与最后一个保留值比较即可。返回 write，保留区间为 a[0…write−1]。",
    },
    {
      ref: "2", page: 1, title: "原地逆置不带头结点的单链表",
      topics: ["linked-list", "algorithm-design"], note: recovered,
      prompt: "head 指向不带头结点的单链表的首个数据结点。设计原地逆置算法，返回新的首结点，要求 O(n) 时间、O(1) 额外空间。",
      model: "初始 prev=null、p=head。当 p 非空时先用 q 暂存 p.next，再令 p.next=prev，随后令 prev=p、p=q。返回 prev。prev 始终是已反转前缀的头指针，p 指向尚未处理的第一个结点。",
    },
    {
      ref: "3", page: 1, title: "检测单链表是否有环",
      topics: ["linked-list", "connectivity", "algorithm-design"], note: recovered,
      prompt: "给定单链表的首结点 head，设计算法判断后继指针形成的链是否含环。要求 O(n) 时间、O(1) 额外空间，并证明正确性。",
      model: "设置 slow=fast=head。当 fast 和 fast.next 均非空时，先让 slow 前进一步、fast 前进两步，再比较指针；相同即有环。循环退出表示已经到达链尾。若有环，两指针入环后，它们的相对位置每轮前进一格，至多一个环长便相遇。设入环前有 μ 个结点，环长 λ，则时间 O(μ+λ)。",
    },
  ]);

  addChapter(3, "栈和队列", [
    {
      ref: "1", page: 1, title: "双栈队列的布尔出队接口",
      topics: ["stack", "queue", "adt", "algorithm-design"], note: recovered,
      prompt: "只用两个栈 S₁、S₂ 实现 enQueue(x)、deQueue()、queue_empty()。其中 deQueue() 删除队首并返回成功与否，空队列返回 false。给出三个操作的伪代码。",
      model: "enQueue(x) 将 x 压入 S₁。queue_empty() 检查两栈是否都空。deQueue() 先判空，空则返回 false；S₂ 为空时，将 S₁ 中元素逐个弹出并压入 S₂；随后弹出 S₂ 的栈顶并返回 true。S₂ 顶端总是已进入 S₂ 的最早元素，只有它们全部出队后才转移更晚的一批。",
    },
    {
      ref: "2", page: 1, title: "铁路单栈出站序列计数",
      topics: ["stack", "recursion"], note: recovered,
      prompt: "n 辆按 1、2、…、n 顺序入站的列车经过一个只允许从同一端驶入驶出的车站。任意合法交替执行进站与出站时，有多少种可能的出站顺序？推导递推式及通项。",
      model: "设 Aₙ 为出站顺序数，A₀=1。固定最后出站的列车为 k，则小于 k 的车都要在 k 入栈前离站，否则会被 k 压在下面。大于 k 的车都在 k 入栈后处理，并先于 k 离开。两段可独立安排，于是 Aₙ=∑(k=1…n) Aₖ₋₁Aₙ₋ₖ。这是卡特兰递推，通项 Aₙ=binom(2n,n)/(n+1)。也可直接把进站、出站看作合法括号序列。",
    },
    {
      ref: "3", page: 1, title: "栈出站序列的禁形判据",
      topics: ["stack", "algorithm-design"], note: recovered,
      prompt: "1、2、…、n 顺次进栈，进栈和出栈可交替进行。证明一个排列 P 能成为出栈序列，当且仅当不存在 i<j<k 使得 Pⱼ<Pₖ<Pᵢ。",
      model: "必要性：若有 i<j<k 且 Pⱼ<Pₖ<Pᵢ，弹出 Pᵢ 前 Pⱼ、Pₖ 都已入栈且均未弹出。因 Pₖ 后入，它挡在 Pⱼ 上面，Pⱼ 无法先于 Pₖ 出栈。充分性：按目标序列贪心。待弹 x 尚未进栈时顺次压到 x；x 在栈顶便弹出。若在位置 j 首次失败，x=Pⱼ 被栈顶 y>x 挡住，且 y 将在位置 k>j 才弹出。y 此前必因某个已成功弹出的 Pᵢ>y 而被压入，i<j。因此 Pⱼ<Pₖ<Pᵢ，和禁形条件矛盾。",
    },
  ]);

  addChapter(4, "字符串", [
    {
      ref: "1", page: 1, title: "线性时间判断链式存储字符串是否回文",
      topics: ["string-processing", "linked-list", "stack", "algorithm-design"],
      prompt: "一个 LString 含表头指针 head、串长 strLen，每个数据结点含字符 data 和后继指针 next。设计时间 O(strLen) 的算法判别给定串是否具有对称性，即是否正反读取相同。",
      model: "沿 next 指针遍历，把所有数据结点的字符顺次存入长度 n 的数组。有虚头结点时从首个数据结点开始。比较数组前半部分的 A[i] 与 A[n−1−i]，所有比较都相同便是回文。时间和额外空间均为 O(n)，通常将空串视作回文。也可只把前半串压栈，再与后半串逐项比较，奇数长度时跳过中间字符。",
    },
    {
      ref: "2", page: 1, title: "判断两个字符串是否互为循环旋转",
      topics: ["string-match", "algorithm-design"],
      prompt: "设计算法在线性时间内判断字符串 T 是否为 T′ 的循环旋转。例如 arc 和 car 互为循环旋转。",
      model: "长度不同直接判否，两个空串判真。对于长度相同的非空串，构造 T′+T′，用 KMP 查找 T。长度 n 的每个循环旋转都对应双串中某个从 0 到 n−1 开始的长度 n 窗口，反过来这些窗口也都是旋转。时间 O(n)，额外空间 O(n)，且可以在搜索时用下标取模代替实际拼接。",
    },
    {
      ref: "3（普通 next）", page: 2, title: "证明普通 KMP 失配回退的正确性",
      topics: ["string-match"],
      prompt: "证明教材中采用普通 next 数组的 KMP 算法正确。说明 next 数组如何得到，以及寻找最长相等真前后缀为何不会跳过真正的匹配。",
      model: "设已匹配 j 个字符且下一字符失配。仍有机会继续匹配的更短对齐，必须使模式的一个前缀与刚刚匹配文本的一个后缀重合。该后缀同时是模式前 j 个字符的后缀，因此可选长度恰为这个已匹配前缀的真前后缀长度。next[j] 取最长的一个；再失败时继续沿 next 链考察更短的长度，所以不会漏解。构造表时，用相同的不变量把已求出的最长真前后缀作为扩展候选，不能用新字符扩展时沿回退链寻找次长候选。每步都先看最长可扩展的候选，因此得到的新前后缀也是最长的。",
    },
    {
      ref: "3（优化 next）", page: 3, title: "证明 nextval 跳过必然失败的比较",
      topics: ["string-match"],
      prompt: "证明教材中使用优化 next 数组（nextval）的 KMP 仍然正确。说明为什么模式串的两个比较位置字符相同就可以进一步跳转。",
      model: "设文本字符 x 与模式的 P[j] 已经失配，普通回退打算比较 P[k]，其中 k=next[j]。若 k≥0 且 P[k]=P[j]，则同一文本字符 x 与 P[k] 也必失配，可以直接沿 k 的失配链后移。用 nextval[k] 复用已经合并的跳转；若这两个字符不同，则保留 k，基例 nextval[0]=−1。整个优化只合并普通 KMP 中必然失败的比较，因而保持所有可能的匹配起点。",
    },
  ]);
})();

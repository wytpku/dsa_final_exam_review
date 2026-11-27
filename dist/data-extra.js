window.DSA_PAPERS.push({
  id: "2015-extra",
  label: "2015 补充卷",
  details: "libpku 收录的《2015年〈数据结构与算法A〉期末考试试题》答题版",
  source: "assets/sources/2015-16DS期末考试.pdf",
  answerSource: "assets/sources/2015-16DS期末考试.pdf",
  questions: [
    {
      ref: "一、1", page: 1, answerPage: 1, title: "上三角矩阵的行优先压缩",
      prompt: "15 阶上三角矩阵 A 按行优先排列上三角区（含对角线），压入一维数组 B。矩阵和数组下标均从 0 开始。A[9][9] 在 B 中的下标是多少？",
      answers: [["99"]],
      explanation: "第 0 至 8 行分别存 15、14、…、7 个元素，合计 99 个。A[9][9] 位于第 9 行首位。随卷填写的 92 漏算了第 8 行。",
    },
    {
      ref: "一、2", page: 1, answerPage: 1, title: "广义表的表头和表尾",
      prompt: "L = ((), ())。求 head(L)、tail(L)、L 的长度以及 L 的深度。",
      fields: ["head(L)", "tail(L)", "长度", "深度"],
      answers: [["()", "空表"], ["(())"], ["2"], ["2"]],
      explanation: "两个元素都是空表。表尾是去掉第一个元素后得到的表，仍保留一层外括号。按空表深度为 1 的约定，L 的深度为 2。",
    },
    {
      ref: "一、3", page: 1, answerPage: 1, title: "最优二叉搜索树的加权比较次数",
      prompt: "有序关键码 A、B、C、D 的成功访问频数依次为 1、5、4、3。从最左到最右的五个查找失败区间，频数依次为 5、4、3、2、1。求最优二叉搜索树的加权比较次数总和。",
      answers: [["57"]],
      explanation: "最优树以 B 为根，左子树为 A，右子树为 C，D 是 C 的右孩子。成功的加权比较次数是 1×2+5×1+4×2+3×3=24，失败的是 5×2+4×2+3×2+2×3+1×3=33。若把频数归一化，平均比较次数是 57/28。",
    },
    {
      ref: "二、1（1）", page: 1, answerPage: 2, title: "画出广义表的存储结构",
      prompt: "为广义表 A = (((a)), (b), c, (a), (((d, e)))) 画出一种链式存储结构。",
      model: "顶层是一串 5 个同级结点，类型依次为子表、子表、原子、子表、子表。子表向下指向各自的首结点。第 1 项有两层表包装后到原子 a，第 2 项指向原子 b，第 4 项指向原子 a，第 5 项有三层表包装后到同级的 d 和 e。同级链的末尾均置空。",
    },
    {
      ref: "二、1（2）", page: 1, answerPage: 2, title: "计算广义表的长度和深度",
      prompt: "广义表 A = (((a)), (b), c, (a), (((d, e)))) 的长度和深度分别是多少？",
      fields: ["长度", "深度"],
      answers: [["5"], ["4"]],
      explanation: "最外层有 5 个元素，最后一项从最外层算起有四层括号。",
    },
    {
      ref: "二、1（3）", page: 1, answerPage: 2, title: "用 head 和 tail 取出原子 e",
      prompt: "广义表 A = (((a)), (b), c, (a), (((d, e))))。只使用 head 和 tail，写出取出原子 e 的表达式。可以用中间变量。",
      model: "B = head(tail(tail(tail(tail(A))))), 此时 B = (((d,e)))。C = head(head(B)), 此时 C = (d,e)。最后 e = head(tail(C))。",
    },
    {
      ref: "二、2", page: 2, answerPage: 2, title: "给定高度的 AVL 树结点数",
      prompt: "对于给定高度 h 的 AVL 树，推导最少结点数和最多结点数。高度可以按层数计，注明约定。",
      model: "约定空树高度 0。最大结点数为 2^h−1，由满二叉树达到。设 M(h) 是最少结点数，则 M(0)=0，M(1)=1，M(h)=1+M(h−1)+M(h−2)。高度较大的子树必须达到 h−1，平衡性要求另一侧至少 h−2，取这两个最小子树可达到下界。故 M(h)=F(h+2)−1，其中 F(0)=0、F(1)=1。",
    },
    {
      ref: "三、1", page: 2, answerPage: 3, title: "字典树插入单词",
      prompt: "在 Trie 中实现单词插入。每个结点保存 next[26]，isStr 表示此处是否为完整单词的末尾。输入由小写英文字母组成，请写出插入过程。",
      note: "存档只保留了已经填好的代码。这道练习按同一 Trie 结点结构重述。",
      model: "从根指针 p 开始，逐字符 c 令 i=c−'a'。若 p.next[i] 为空，就创建 isStr=false、全部子指针为空的新结点。令 p=p.next[i]，继续处理下一字符。全部字符处理后令 p.isStr=true。时间复杂度 O(|s|)，最多新增 |s| 个结点。",
    },
    {
      ref: "四、1", page: 3, answerPage: 4, title: "支持插删改和区间聚合的序列",
      prompt: "维护一个动态数组，支持在第 k 个元素后插入 x、删除第 k 个元素、修改第 k 个元素、求 [k₁,k₂] 区间和，以及求全数组的最大连续子段和。设计数据结构并说明各操作和复杂度。",
      model: "可以使用按子树大小隐式编号的 Treap。每个子树维护 size、sum、最大前缀和 pref、最大后缀和 suff、最大非空子段和 best。拼接两段 L、R 时，best=max(L.best,R.best,L.suff+R.pref)，pref=max(L.pref,L.sum+R.pref)，suff 同理。按位置 split 后通过 merge 插删，修改后沿合并路径更新，拆出目标区间读取 sum，再合回。全数组的最大子段和直接读取根的 best。随机平衡下，更新和求区间和的期望时间为 O(log n)，全局查询 O(1)。也可使用按秩操作的伸展树，获得摊还 O(log n)。",
    },
  ],
});

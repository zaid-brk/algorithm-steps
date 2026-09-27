const problems = {
  custom: {title:'Your problem',label:'Custom walkthrough',visual:'Variables and data',code:[]},
  tree: {
    title: 'Binary Tree Level Order Traversal', hint: 'Example: [3,9,20,null,null,15,7]', label: 'Tree as level-order values', visual: 'Tree and queue',
    presets: [['Classic tree', '[3,9,20,null,null,15,7]'], ['Small tree', '[1,2,3,4,null,null,5]']],
    code: [
      'def levelOrder(root):',
      '    if not root: return []',
      '    result = []',
      '    queue = [root]',
      '    while queue:',
      '        level = []',
      '        for _ in range(len(queue)):',
      '            node = queue.pop(0)',
      '            level.append(node.val)',
      '            if node.left:',
      '                queue.append(node.left)',
      '            if node.right:',
      '                queue.append(node.right)',
      '        result.append(level)',
      '    return result'
    ]
  },
  intervals: {
    title: 'Merge Intervals', hint: 'Example: [[1,3],[2,6],[8,10],[15,18]]', label: 'List of intervals', visual: 'Intervals and merged result',
    presets: [['Overlapping', '[[1,3],[2,6],[8,10],[15,18]]'], ['Touching edges', '[[1,4],[4,5],[9,11]]']],
    code: [
      'def merge(intervals):',
      '    intervals.sort()',
      '    merged = []',
      '    for start, end in intervals:',
      '        if merged and start <= merged[-1][1]:',
      '            merged[-1][1] = max(merged[-1][1], end)',
      '        else:',
      '            merged.append([start, end])',
      '    return merged'
    ]
  },
  array: {
    title: 'Merge Sorted Array', hint: 'Example: {"nums1":[1,2,3,0,0,0],"m":3,"nums2":[2,5,6],"n":3}', label: 'Arrays and their valid lengths', visual: 'Array slots and pointers',
    presets: [['Two arrays', '{"nums1":[1,2,3,0,0,0],"m":3,"nums2":[2,5,6],"n":3}'], ['First array empty', '{"nums1":[0,0,0],"m":0,"nums2":[1,2,3],"n":3}']],
    code: [
      'def merge(nums1, m, nums2, n):',
      '    i, j, k = m - 1, n - 1, m + n - 1',
      '    while j >= 0:',
      '        if i >= 0 and nums1[i] > nums2[j]:',
      '            nums1[k] = nums1[i]',
      '            i -= 1',
      '        else:',
      '            nums1[k] = nums2[j]',
      '            j -= 1',
      '        k -= 1'
    ]
  }
};

function checkInt(value) { return Number.isSafeInteger(value) && Math.abs(value) <= 999; }
function parseInput(type, text) {
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('Use valid JSON: numbers, brackets, commas, and null where needed.'); }
  if (type === 'tree') {
    if (!Array.isArray(data) || data.length > 31 || !data.every(v => v === null || checkInt(v))) throw new Error('Enter up to 31 tree values, each a whole number or null.');
    if (data.length && data[0] === null && data.some(v => v !== null)) throw new Error('A null root cannot have any children.');
    const nodes = [];
    if (data.length && data[0] !== null) {
      nodes.push({id: 0, val: data[0], left: null, right: null});
      let read = 1;
      for (let parent = 0; parent < nodes.length && read < data.length; parent++) {
        for (const side of ['left', 'right']) {
          if (read >= data.length) break;
          if (data[read] !== null) { const id = nodes.length; nodes.push({id, val: data[read], left: null, right: null}); nodes[parent][side] = id; }
          read++;
        }
      }
      if (read < data.length && data.slice(read).some(v => v !== null)) throw new Error('These last values have no parent. Check the null placeholders.');
    }
    function height(id) { return id === null ? 0 : 1 + Math.max(height(nodes[id].left), height(nodes[id].right)); }
    if (nodes.length > 15 || (nodes.length && height(0) > 4)) throw new Error('Use a small tree: at most 15 nodes and 4 levels, so the drawing stays readable.');
    return {nodes};
  }
  if (type === 'intervals') {
    if (!Array.isArray(data) || data.length > 8 || !data.every(pair => Array.isArray(pair) && pair.length === 2 && pair.every(checkInt) && pair[0] <= pair[1])) throw new Error('Enter up to 8 intervals like [[1,3],[2,6]], with start ≤ end.');
    return {intervals: data.map(pair => [...pair])};
  }
  if (!data || Array.isArray(data) || typeof data !== 'object') throw new Error('Enter an object with nums1, m, nums2, and n.');
  const {nums1, m, nums2, n} = data;
  if (!Array.isArray(nums1) || !Array.isArray(nums2) || !Number.isInteger(m) || !Number.isInteger(n) || m < 0 || n < 0 || m + n > 12 || nums1.length !== m + n || nums2.length !== n || !nums1.every(checkInt) || !nums2.every(checkInt)) throw new Error('Use up to 12 total values. nums1 must have m + n slots, and nums2 must have n values.');
  if (nums1.slice(0,m).some((v,i,a) => i && v < a[i-1]) || nums2.some((v,i,a) => i && v < a[i-1])) throw new Error('The first m values of nums1 and all of nums2 must already be sorted.');
  return {nums1:[...nums1], nums2:[...nums2], m, n};
}

function makeTrace(type, input) {
  const steps = [];
  if (type === 'tree') {
    const {nodes} = input; let queue = [], level = [], result = [], current = null, processed = [];
    const push = (line,title,body) => steps.push({line,title,body, state:{queue:[...queue],level:[...level],result:result.map(a=>[...a]),current,processed:[...processed]}});
    push(1,'Start with the tree','root is the top node. We will visit it first, then work down one row at a time.');
    push(2,'Check for an empty tree',nodes.length ? `The root is ${nodes[0].val}, so we keep going.` : 'There is no root, so the answer is an empty list.');
    if (!nodes.length) return steps;
    push(3,'Make the answer list','result will hold one list per tree level. It starts empty.');
    queue = [0]; push(4,'Put the root in the queue',`queue is our waiting line. ${nodes[0].val} is first.`);
    while (queue.length) {
      push(5,'Check the waiting line','The queue has nodes, so there is another level to process.');
      level = []; current = null; push(6,'Start a fresh level','level will collect the values from this row only.');
      const count = queue.length; push(7,'Count this level',`There ${count === 1 ? 'is' : 'are'} ${count} node${count === 1 ? '' : 's'} waiting right now. The for loop runs exactly ${count} time${count === 1 ? '' : 's'}, even if we add children to the queue.`);
      for (let t = 0; t < count; t++) {
        const id = queue.shift(), node = nodes[id]; current = id; processed.push(id);
        push(8,'Take the next node',`Remove ${node.val} from the front of the queue. This is the node we are working on.`);
        level.push(node.val); push(9,'Save its value',`Add ${node.val} to this level: [${level.join(', ')}].`);
        push(10,'Check the left child',node.left === null ? `${node.val} has no left child.` : `${node.val} has a left child: ${nodes[node.left].val}.`);
        if (node.left !== null) { queue.push(node.left); push(11,'Queue the left child',`Add ${nodes[node.left].val} to the back. It will be processed on the next level.`); }
        push(12,'Check the right child',node.right === null ? `${node.val} has no right child.` : `${node.val} has a right child: ${nodes[node.right].val}.`);
        if (node.right !== null) { queue.push(node.right); push(13,'Queue the right child',`Add ${nodes[node.right].val} to the back. It waits behind any nodes already there.`); }
        if (t + 1 < count) push(7,'Next node on this level','The for loop still has another node from this row to visit.');
      }
      result.push([...level]); current = null; push(14,'Finish this level',`Append [${level.join(', ')}] as one group in result.`);
    }
    push(5,'Check the waiting line','The queue is empty, so the while loop stops.');
    push(15,'Return the answer',`The levels are ${JSON.stringify(result)}.`);
    return steps;
  }
  if (type === 'intervals') {
    let intervals = input.intervals.map(a=>[...a]), merged = [], current = null, start = null, end = null;
    const push = (line,title,body) => steps.push({line,title,body,state:{intervals:intervals.map(a=>[...a]),merged:merged.map(a=>[...a]),current,start,end}});
    push(1,'Start with the intervals','Each pair has a start and an end. We want to combine pairs that overlap.');
    intervals.sort((a,b)=>a[0]-b[0] || a[1]-b[1]); push(2,'Sort by start','Sorting places earlier intervals first, so we can build the answer from left to right.');
    push(3,'Make an empty result','merged starts as an empty list.');
    for (let t=0;t<intervals.length;t++) {
      current=t; [start,end]=intervals[t]; push(4,'Look at the next interval',`The current interval is [${start}, ${end}].`);
      const overlap=merged.length>0 && start<=merged[merged.length-1][1];
      push(5,'Check for overlap',!merged.length ? 'merged is empty, so there is nothing to compare against.' : overlap ? `${start} starts before or at the last merged end (${merged[merged.length-1][1]}), so they overlap.` : `${start} starts after the last merged end (${merged[merged.length-1][1]}), so they stay separate.`);
      if (overlap) { const before=merged[merged.length-1][1]; merged[merged.length-1][1]=Math.max(before,end); push(6,'Extend the last interval',`Keep the earlier start and make the end max(${before}, ${end}) = ${merged[merged.length-1][1]}.`); }
      else { push(7,'Take the separate case','This interval does not overlap the last merged one.'); merged.push([start,end]); push(8,'Add a new interval',`Append [${start}, ${end}] to merged.`); }
    }
    current=null; start=null; end=null; push(9,'Return the merged list',`The result is ${JSON.stringify(merged)}.`);
    return steps;
  }
  let {nums1,nums2,m,n}=input; nums1=[...nums1]; let i=null,j=null,k=null,write=null,source=null;
  const push=(line,title,body)=>steps.push({line,title,body,state:{nums1:[...nums1],nums2:[...nums2],m,n,i,j,k,write,source}});
  push(1,'Start with two sorted arrays','Only the first m values in nums1 are real values. Its extra slots are space for the merge.');
  i=m-1;j=n-1;k=m+n-1; push(2,'Point at the three ends',`i = ${i} (last real value in nums1), j = ${j} (last value in nums2), and k = ${k} (last slot to fill).`);
  while(j>=0) {
    write=null;source=null;push(3,'Check nums2',`j is ${j}, so nums2 still has a value to place.`);
    const fromFirst=i>=0 && nums1[i]>nums2[j];
    push(4,'Compare the rightmost values',i<0 ? 'i is past the start. nums1 has no unused values left, so take from nums2.' : fromFirst ? `${nums1[i]} is greater than ${nums2[j]}. Put the larger value into the last open slot.` : `${nums1[i]} is not greater than ${nums2[j]}. Take ${nums2[j]} from nums2 (including a tie).`);
    if(fromFirst) {
      const value=nums1[i]; nums1[k]=value; write=k;source='nums1';push(5,'Copy from nums1',`Write ${value} into nums1[${k}]. This is safe because we fill from the back.`);
      i--;push(6,'Move i left',`The old nums1 value was used. i is now ${i}.`);
    } else {
      push(7,'Take the nums2 branch','The next value comes from nums2.');
      const value=nums2[j];nums1[k]=value;write=k;source='nums2';push(8,'Copy from nums2',`Write ${value} into nums1[${k}].`);
      j--;push(9,'Move j left',`That nums2 value was used. j is now ${j}.`);
    }
    k--;push(10,'Move the open slot left',`k is now ${k}. The next write goes one position earlier.`);
  }
  write=null;source=null;push(3,'Stop when nums2 is done',`j is ${j}, so there are no nums2 values left. Any unused nums1 values are already in place. Final nums1: ${JSON.stringify(nums1)}.`);
  return steps;
}

// The view uses only validated numbers and fixed labels in HTML strings.
const $ = id => document.getElementById(id);
let selected='tree', trace=[], input=null, stepIndex=0, activePreset=0;
function fmt(x){ return x===null ? '—' : JSON.stringify(x); }
function renderVariables(state) {
  if(selected==='custom') {
    $('variables').replaceChildren(...state.map(item=>{const card=document.createElement('div');card.className='variable';const name=document.createElement('span');name.className='name';name.textContent=item.name;const value=document.createElement('span');value.className='value';value.textContent=item.value;card.append(name,value);return card;}));
    return;
  }
  const keys = selected==='tree' ? ['queue','level','result','current'] : selected==='intervals' ? ['intervals','start','end','merged'] : ['i','j','k','nums1','nums2'];
  const shown = {...state};
  if(selected==='tree') shown.queue=state.queue.map(id=>input.nodes[id].val);
  if(selected==='tree') shown.current=state.current===null ? null : input.nodes[state.current].val;
  $('variables').replaceChildren(...keys.map(key=>{const card=document.createElement('div');card.className='variable';const name=document.createElement('span');name.className='name';name.textContent=key;const value=document.createElement('span');value.className='value';value.textContent=fmt(shown[key]);card.append(name,value);return card;}));
}
function renderTree(state) {
  const nodes=input.nodes, positions={};let depth=0;
  function place(id,x,y,offset){if(id===null)return;positions[id]={x,y};depth=Math.max(depth,y);const node=nodes[id];place(node.left,x-offset,y+1,offset/2);place(node.right,x+offset,y+1,offset/2);}
  if(nodes.length)place(0,380,0,190);
  const height=Math.max(112,(depth+1)*78+48);
  const edges=nodes.flatMap(node=>['left','right'].filter(side=>node[side]!==null).map(side=>`<line class="tree-edge" x1="${positions[node.id].x}" y1="${positions[node.id].y*78+35}" x2="${positions[node[side]].x}" y2="${positions[node[side]].y*78+35}"/>`)).join('');
  const circles=nodes.map(node=>{const p=positions[node.id],active=node.id===state.current,queued=state.queue.includes(node.id);return `<circle class="tree-node ${active?'active':queued?'queued':''}" cx="${p.x}" cy="${p.y*78+35}" r="22"/><text class="tree-text ${active?'active':''}" x="${p.x}" y="${p.y*78+36}">${node.val}</text>`;}).join('');
  const queue=state.queue.map(id=>`<span class="pill">${nodes[id].val}</span>`).join('')||'<span class="empty">empty</span>';
  const levels=state.result.map(level=>`<span class="pill">[${level.join(', ')}]</span>`).join('')||'<span class="empty">none yet</span>';
  $('visual').innerHTML=`${nodes.length?`<svg class="tree-svg" viewBox="0 0 760 ${height}" role="img" aria-label="Binary tree with current node and queued nodes highlighted">${edges}${circles}</svg>`:'<p class="empty">Empty tree</p>'}<div class="subvisual-label">Queue · front first</div><div class="pill-row">${queue}</div><div class="subvisual-label">Finished levels</div><div class="pill-row">${levels}</div>`;
}
function intervalBars(list,active,min,max){return list.map(([a,b],i)=>`<div class="interval-item ${i===active?'active':''}"><span>#${i+1}</span><div class="interval-track"><div class="interval-bar" style="left:${(a-min)/(max-min)*100}%;width:${Math.max(1,(b-a)/(max-min)*100)}%"></div></div><span class="interval-code">[${a},${b}]</span></div>`).join('')||'<span class="empty">none yet</span>';}
function renderIntervals(state){const all=[...state.intervals,...state.merged].flat();const min=all.length?Math.min(...all):0,max=all.length?Math.max(...all,min+1):1;$('visual').innerHTML=`<div class="subvisual-label">Sorted input</div><div class="interval-list">${intervalBars(state.intervals,state.current,min,max)}</div><div class="axis"><span>${min}</span><span>${max}</span></div><div class="subvisual-label result-label">Merged so far</div><div class="interval-list">${intervalBars(state.merged,state.merged.length-1,min,max)}</div><p class="note">Intervals that touch at an endpoint count as overlapping.</p>`;}
function cells(array,active,written,placeholder){return `<div class="array-row">${array.map((value,index)=>`<div class="array-cell"><div class="array-value ${index===active?'active':''} ${index===written?'written':''}">${value}</div><div class="array-index">${index}${placeholder!==undefined&&index>=placeholder?' · space':''}</div></div>`).join('')||'<span class="empty">empty</span>'}</div>`;}
function renderArray(state){$('visual').innerHTML=`<div class="subvisual-label">nums1 · answer goes here</div>${cells(state.nums1,state.i,state.write,state.m)}<div class="pointer-list"><span class="pointer">i = ${fmt(state.i)}</span><span class="pointer">k = ${fmt(state.k)}</span></div><div class="subvisual-label">nums2</div>${cells(state.nums2,state.j,null)}<div class="pointer-list"><span class="pointer">j = ${fmt(state.j)}</span></div><p class="note">Green marks the slot written on this step. The original extra slots in nums1 are labeled “space.”</p>`;}
function renderCustom(state){const holder=$('visual');holder.replaceChildren();for(const item of state){const group=document.createElement('div');group.className='custom-state-group';const label=document.createElement('div');label.className='subvisual-label';label.textContent=item.name;group.append(label);let parsed;try{parsed=JSON.parse(item.value);}catch{parsed=item.value;}
    if(Array.isArray(parsed)){const row=document.createElement('div');row.className='array-row';parsed.forEach((value,index)=>{const cell=document.createElement('div');cell.className='array-cell';const content=document.createElement('div');content.className='array-value'+(index===item.focusIndex?' active':'');content.textContent=typeof value==='object'?JSON.stringify(value):String(value);const number=document.createElement('div');number.className='array-index';number.textContent=index;cell.append(content,number);row.append(cell);});group.append(row);}
    else {const value=document.createElement('div');value.className='custom-value';value.textContent=item.value;group.append(value);}holder.append(group);}if(!state.length){const empty=document.createElement('p');empty.className='empty';empty.textContent='No values at this step.';holder.append(empty);}}
function renderEmpty(){ $('visual-title').textContent='Variables and data';$('visual').textContent='Your walkthrough will appear here.';$('variables').replaceChildren();$('code').replaceChildren();$('step-title').textContent='Add your problem above';$('step-body').textContent='Paste the prompt and generate a walkthrough to follow its code and state one step at a time.';$('step-dot').textContent='0';$('step-count').textContent='0 / 0';$('step-range').value=0;$('step-range').max=0;$('prev-button').disabled=true;$('next-button').disabled=true;$('state-tag').textContent='';}
function render(){const current=trace[stepIndex];if(!current){renderEmpty();return;}const p=problems[selected];$('visual-title').textContent=selected==='custom'?input.title:p.visual;$('step-title').textContent=current.title;$('step-body').textContent=current.body;$('step-dot').textContent=stepIndex+1;$('step-count').textContent=`${stepIndex+1} / ${trace.length}`;$('step-range').max=trace.length-1;$('step-range').value=stepIndex;$('prev-button').disabled=stepIndex===0;$('next-button').disabled=stepIndex===trace.length-1;$('state-tag').textContent=selected==='tree'?'front of queue → back':'';
  const lines=selected==='custom'?input.codeLines:p.code;
  $('code').replaceChildren(...lines.map((line,index)=>{const row=document.createElement('div');row.className='code-line'+(index+1===current.line?' active':'');if(index+1===current.line)row.setAttribute('aria-current','step');const num=document.createElement('span');num.className='line-number';num.textContent=index+1;const body=document.createElement('span');body.textContent=line;row.append(num,body);return row;}));
  renderVariables(current.state); if(selected==='tree')renderTree(current.state);else if(selected==='intervals')renderIntervals(current.state);else if(selected==='array')renderArray(current.state);else renderCustom(current.state);
}
function run(text){const parsed=parseInput(selected,text);const next=makeTrace(selected,parsed);input=parsed;trace=next;stepIndex=0;$('input-error').hidden=true;render();return {problem:selected,steps:trace.length};}
function changeProblem(type){if(!problems[type])throw new Error('Unknown problem.');selected=type;activePreset=0;$('input-label').textContent=problems[type].label;$('standard-controls').hidden=type==='custom';$('custom-controls').hidden=type!=='custom';$('plan-card').hidden=true;$('problem-tabs').replaceChildren(...Object.entries(problems).map(([key,p])=>{const button=document.createElement('button');button.type='button';button.textContent=p.title;button.setAttribute('aria-current',key===type?'page':'false');button.addEventListener('click',()=>changeProblem(key));return button;}));if(type==='custom'){input=null;trace=[];stepIndex=0;renderEmpty();return;}$('input-hint').textContent=problems[type].hint;$('example-input').value=problems[type].presets[0][1];renderPresets();run($('example-input').value);}
function renderPresets(){$('presets').replaceChildren(...problems[selected].presets.map(([label,value],index)=>{const button=document.createElement('button');button.type='button';button.textContent=label;button.className=index===activePreset?'active':'';button.addEventListener('click',()=>{activePreset=index;$('example-input').value=value;renderPresets();run(value);});return button;}));}
function goToStep(index){if(!Number.isInteger(index)||index<0||index>=trace.length)throw new Error(`Step must be between 0 and ${trace.length-1}.`);stepIndex=index;render();return {step:stepIndex+1,total:trace.length,title:trace[stepIndex].title};}
async function generateCustom(problem,example){if(typeof problem!=='string'||problem.trim().length<8||problem.length>6000||typeof example!=='string'||example.length>1000)throw new Error('Enter a problem description (at least 8 characters) and a short optional example.');const response=await fetch('/api/walkthrough',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({problem:problem.trim(),example:example.trim()})});let data;try{data=await response.json();}catch{throw new Error('Could not read the walkthrough response. Try again.');}if(!response.ok)throw new Error(data.error||'Could not generate a walkthrough. Try again.');if(!Array.isArray(data.codeLines)||!Array.isArray(data.steps)||!data.steps.length)throw new Error('The walkthrough was incomplete. Please try again.');
  selected='custom';input=data;trace=data.steps.map(s=>({line:s.line,title:s.title,body:s.explanation,state:s.state}));stepIndex=0;$('plan-brainstorming').textContent=data.brainstorming;$('plan-idea').textContent=data.idea;$('plan-pseudocode').textContent=data.pseudocode;$('plan-card').hidden=false;$('custom-error').hidden=true;render();return {title:data.title,steps:trace.length};}
if(typeof document!=='undefined'){
  changeProblem('tree');
  $('run-button').addEventListener('click',()=>{try{run($('example-input').value);}catch(e){$('input-error').textContent=e.message;$('input-error').hidden=false;}});
  $('generate-button').addEventListener('click',async()=>{const button=$('generate-button');button.disabled=true;button.textContent='Generating…';$('custom-error').hidden=true;try{await generateCustom($('problem-input').value,$('custom-example').value);}catch(e){$('custom-error').textContent=e.message;$('custom-error').hidden=false;}finally{button.disabled=false;button.textContent='Generate walkthrough';}});
  $('example-input').addEventListener('input',()=>{activePreset=-1;renderPresets();$('input-error').hidden=true;});
  $('prev-button').addEventListener('click',()=>goToStep(stepIndex-1));$('next-button').addEventListener('click',()=>goToStep(stepIndex+1));
  $('step-range').addEventListener('input',e=>goToStep(Number(e.target.value)));
  document.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey||['TEXTAREA','INPUT'].includes(document.activeElement?.tagName))return;if(e.key==='ArrowRight'&&stepIndex<trace.length-1){goToStep(stepIndex+1);e.preventDefault();}if(e.key==='ArrowLeft'&&stepIndex>0){goToStep(stepIndex-1);e.preventDefault();}});
  if(document.modelContext?.registerTool){
    const context=document.modelContext;
    Promise.resolve(context.registerTool({name:'start_algorithm_example',title:'Start algorithm example',description:'Choose one of the three built-in problems and run a small JSON example in the visual tutor.',inputSchema:{type:'object',properties:{problem:{type:'string',enum:['tree','intervals','array']},json:{type:'string'}},required:['problem','json'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(args){if(!args||!['tree','intervals','array'].includes(args.problem)||typeof args.json!=='string')throw new Error('Provide a valid built-in problem and JSON string.');const parsed=parseInput(args.problem,args.json);const steps=makeTrace(args.problem,parsed);changeProblem(args.problem);$('example-input').value=args.json;input=parsed;trace=steps;stepIndex=0;activePreset=-1;renderPresets();render();return {problem:args.problem,steps:steps.length};}})).catch(()=>{});
    Promise.resolve(context.registerTool({name:'go_to_algorithm_step',title:'Go to algorithm step',description:'Move the visible tutor to a zero-based step in the current example.',inputSchema:{type:'object',properties:{index:{type:'integer',minimum:0}},required:['index'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(args){return goToStep(args?.index);}})).catch(()=>{});
    Promise.resolve(context.registerTool({name:'generate_custom_walkthrough',title:'Generate custom walkthrough',description:'Generate a beginner-friendly Python solution and step-by-step trace for a pasted LeetCode problem.',inputSchema:{type:'object',properties:{problem:{type:'string'},example:{type:'string'}},required:['problem','example'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},async execute(args){if(!args||typeof args.problem!=='string'||args.problem.trim().length<8||args.problem.length>6000||typeof args.example!=='string'||args.example.length>1000)throw new Error('Provide a problem description and a short optional example.');changeProblem('custom');$('problem-input').value=args.problem;$('custom-example').value=args.example;return await generateCustom(args.problem,args.example);}})).catch(()=>{});
  }
}
globalThis.AlgorithmTutor={problems,parseInput,makeTrace,generateCustom};

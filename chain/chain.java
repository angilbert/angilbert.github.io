import java.awt.*;
import java.awt.event.*;
import java.lang.*;
import java.util.*;

// An example of a puzzle that can be presented by puzzlePresenter

public class chain extends Canvas implements stdPuzz, solvePuzz, generatePuzz, Runnable
{
  public String encStr;
  public int totalSolns,falsePaths;
  
  private String origTitleStr, origEncStr;
  private String titleStr, spare1;
  private StringBuffer solnStr;
  private StringBuffer solnDetails;
  private int puzz[][];
  private Image offScrImg;
  private int sqsz,rows,cols,ex,ey;
  private int symbolCount=0;
  private boolean haveWon=false;
  private boolean abortSolve;
  private Thread myThread;

  Dimension curDim;
  Point mover=null;
  
  static final int MARK   = 0x01;
  static final int SQUARE = 0x02;
  static final int CIRCLE = 0x04;
  static final int RED    = 0x10;
  static final int BLUE   = 0x20;
  static final int GREEN  = 0x40;
  static final int YELLOW = 0x80;

  // constructors

  public chain()
  {
    this("sample", "3311rgbRGBrgb");
  }

  // must be public for getConstructor() to find it...

  public chain(String s, String e)
  {
    origTitleStr = s;
    origEncStr = e;

    titleStr = s; encStr = e;
    setBackground(Color.white);
    setForeground(Color.black);

    if (s != "temp") 
      loadPuzz(true);		// decode and initialise
  }

  public String puzzType()    { return "Chain-reaction"; }
  public String puzzAbout()   { return "Chain-reaction Vn 1.1"; }
  public String puzzConcept() { return null; }
  public boolean wantNEWS()   { return false; }
  public boolean wantLOAD()   { return false; }
  public boolean wantSAVE()   { return false; }
  public boolean wantMARK()   { return false; }
  public boolean animated()   { return false; }
  public Dimension prefSize() { return (new Dimension(280,280)); }
  public boolean resizeOK()   { return true; }
  public String title()       { return titleStr; }
  public Canvas getCanvas()   { return(this); }
  public void returnFocus()   { requestFocus(); }
  public void abort()         {}

  public boolean setSeq(String moves) { return false; }
  public String getSeq()              { return null; }

  public Panel getRules()  
  { 
     Panel p = new Panel();

     TextArea t = new TextArea("", 8, 40, TextArea.SCROLLBARS_VERTICAL_ONLY);
t.append("Clear the grid by crossing off the coloured symbols one by one. ");
t.append("The black cross indicates your current position, click on grid to move. ");
t.append("At each turn you can travel horizontally or vertically any distance, ");
t.append("but the next symbol must match the current symbol either in shape or colour.");

t.append("\n\nThere is a small selection of pre-canned puzzles, once you've tried these ");
t.append("use auto-generate to select a new random puzzle based on the current pre-canned ");
t.append("puzzle (same size, similar symbol distribution). Auto-generated puzzles may ");
t.append("have up to five solutions, depending on size. They tend to be slightly easier ");
t.append("than the pre-canned puzzles.");

     p.add(t);
     return p;
  }

  public void reinit()
  { 
    encStr = origEncStr;
    titleStr = origTitleStr;
    restart();
  }

  public void restart() 
  {
    haveWon=false;
    loadPuzz(true);
    repaint();
  }

  public void restart2() 
  {
    haveWon=false;
    loadPuzz(true);
    repaint();
  }

  // the recursive bit 
  public boolean solve2(Point loc, int depth)
  {
    boolean rtn=false;
    int fCount=0, tCount=0;

    // for temporary (auto-gen) puzzles abort under various conditions
    if (titleStr=="temp" && totalSolns > rows+1) abortSolve=true;
    if (titleStr=="temp" && falsePaths > 1000) abortSolve=true;
    if (abortSolve) return true;

    if (depth == symbolCount) {	// solved!
      solnDetails.append("Soln: "+solnStr.toString()+","+loc.x+loc.y+"\n");
      totalSolns++;
      return true;
    }

    solnStr.append(","+loc.x+loc.y);

    int curSym = puzz[loc.y][loc.x];
    puzz[loc.y][loc.x] |= MARK;

    for (int y=0; y<rows; y++) {
     if ((puzz[y][loc.x] & MARK) != 0) continue;
     if ((puzz[y][loc.x] & curSym) != 0) {
       rtn = solve2 (new Point(loc.x, y), depth+1);
       if (rtn == true) tCount++;
       else		fCount++;
     }
    } 
    for (int x=0; x<cols; x++) {
     if ((puzz[loc.y][x] & MARK) != 0) continue;
     if ((puzz[loc.y][x] & curSym) != 0) {
       rtn = solve2 (new Point(x, loc.y), depth+1);
       if (rtn == true) tCount++;
       else		fCount++;
     }
    }

    // unwind a level of recursion
    // assumes grid is less than 10x10...

    solnStr.setLength(solnStr.length()-3);
    puzz[loc.y][loc.x] &= ~MARK;

    // only count falsePaths that are at least 2 deep
    if (tCount == 0 && fCount > 0) falsePaths++;

    if (tCount == 0) return false;
    return true;
  }

  public void solveMe()
  {
    abortSolve = false;
    solnDetails= new StringBuffer("");

    totalSolns=0;
    falsePaths=0;
    solnStr = new StringBuffer("");

    // make sure puzzle is reset to start
    if (origTitleStr != "temp") restart();

    // solve recursively...
    solve2 (new Point(mover.x, mover.y), 1);
    
    if (abortSolve) { totalSolns=0; falsePaths=0; }
    else if (totalSolns > 0) {
      solnDetails.append("Total solutions: "+totalSolns+"\n");
      solnDetails.append("Total falsePaths: "+falsePaths);
      //System.out.println(solnDetails.toString());
    }
    // ensure start mark is still set
    puzz[mover.y][mover.x] |= MARK;
  }

  public void mouseClick(boolean up, int x, int y) 
  {
    if (!up) return;

    if (haveWon) return;		// ignore if done

    int dx = x-ex; 
    int dy = y-ey;

    if (dx<0 || dy<0 || dx>(sqsz*cols) || dy>(sqsz*rows)) 
	return;		// off grid

    int col = dx/sqsz;
    int row = dy/sqsz;
    //System.out.println("CLICK: col:"+col+" row:"+row);

    if (row == mover.y && col == mover.x)
    	return; 	// ignore null move

    // symbol must be in same row/column
    if (row != mover.y && col != mover.x) 
    	{ popMsg("Bad move", "Stay in row or column"); return; }

    // symbol must be unmarked
    if ((puzz[row][col] & MARK) != 0) 
    	{ popMsg("Bad move", "Already been there"); return; }

    // symbol must match by shape or colour
    if ((puzz[row][col] & puzz[mover.y][mover.x]) == 0) 
    	{ popMsg("Bad move", "Must match colour or shape"); return; }

    // update mover and mark
    mover.x = col;
    mover.y = row;

    puzz[mover.y][mover.x] |= MARK;

    repaint();
    checkForWin();
  }

  public void navigate(int d)  {}

  public boolean checkForWin()
  {
    if (haveWon) return true;

    int i, j, count=0;
    for (i=0; i<rows; i++) {
      for (j=0; j<cols; j++) 
	if ((puzz[i][j] & MARK) != 0) count++;
    }
    if (count < symbolCount) return false;

    haveWon = true;

    popMsg("Win!", "Congratulations");

    return true;
  }

  // generatePuzz interface ------------------------------

  public void generate()
  {
    // select one of the auto-generated spare puzzles

    if (spare1 != null) 
	{ encStr = spare1; spare1 = null; }
    else  
	{ popMsg("Sorry!!", "AutoGen busy - please try later"); return; }
    
    loadPuzz(false);
    solveMe();

    titleStr = new String("Auto-generated");
    restart2();
  }

  public String genPuzz()
  {
    // generate a new random puzzle based on original puzzle

    StringBuffer newPuzz= new StringBuffer(origEncStr.substring(0,4));

    // Use the original puzzle string as a random seed for the
    // new puzzle. Resulting puzzle will have similar distribution
    // of symbols.

    String seedStr = new String(origEncStr.substring(4,4+(rows*cols)));
    //System.out.println("genPuzz: using seed <"+seedStr+">");
    
    // keep trying until we find a puzzle with 'max' or less solns
    // but count up how many times we go under and over

    int max = rows - (5-rows);
    int countA=0, count0=0;
    char newC;
    chain tmp;

    do {
      newPuzz.setLength(4);

      for (int i=0; i<rows; i++) {
        for (int j=0; j<cols; j++) {
          do { newC = seedStr.charAt((int)(Math.random() * seedStr.length())); }
          while (i==mover.y && j==mover.x && newC==' ');
          newPuzz.append(newC);
        }
      } newPuzz.append(";");

      // use a temp chain object to load and test-solve the puzzle
      tmp = new chain("temp", newPuzz.toString());
     
      tmp.loadPuzz(false);
      tmp.solveMe();

      if (tmp.abortSolve) countA++;
      else if (tmp.totalSolns == 0) count0++;
      else if (tmp.totalSolns > max) count0++;
      else break;
    } 
    while(true);

    //System.out.println("############ genPuzz: <"+tmp.encStr+"> solns="+tmp.totalSolns);
    //System.out.println("############ genPuzz: failed="+count0+" aborted="+countA);
    return tmp.encStr;
  }
  
  public void run()
  {
    //System.out.println("############ running...");

    if (spare1 == null) spare1 = genPuzz();

    // about to terminate thread...
    myThread = null;
  }

  public void makeSpare()
  {
    if (spare1 == null && myThread == null) {
      myThread = new Thread(this);
      myThread.start();
    }
  }

  // solvePuzz interface ------------------------------

  public Panel getSolnInfo()
  {
    solveMe();
    Panel p = new Panel();

    p.add(new TextArea(solnDetails.toString(), 8, 40));
    return p;
  }

  public int solnCount()
  {
    solveMe();
    return totalSolns;
  }

  // private methods -------------------------------------------

  private boolean loadPuzz(boolean logit)
  {
    if (encStr == null) return false;

    //if (logit) System.out.println("loadPuzz: "+encStr);
    symbolCount=0;

    // initialise puzzle array from encoded string

    char c = encStr.charAt(0);
    char r = encStr.charAt(1);
    char mx = encStr.charAt(2);
    char my = encStr.charAt(3);

    if (!Character.isDigit(c) || !Character.isDigit(r)) 
      return false;
    if (!Character.isDigit(mx) || !Character.isDigit(my)) 
      return false;

    cols=Character.digit(c,16);
    rows=Character.digit(r,16);
    int imx=Character.digit(mx,16);
    int imy=Character.digit(my,16);

    if (rows>16 || cols>16) return false;
    if (rows<2 || cols<2) return false;
    if (encStr.length() < 2+(rows*cols)) return false;
  
    if (imx < 0 || imx >= cols) return false;
    if (imy < 0 || imy >= rows) return false;

    puzz = new int[rows][cols];
    mover = new Point(imx,imy);
    
    for (int y=0; y<rows; y++) {
      for (int x=0; x<cols; x++) {
	c = encStr.charAt(4+(y*cols)+x);
        if (c == 'R')      puzz[y][x] = SQUARE | RED;	
        else if (c == 'G') puzz[y][x] = SQUARE | GREEN;	
        else if (c == 'B') puzz[y][x] = SQUARE | BLUE;	
        else if (c == 'Y') puzz[y][x] = SQUARE | YELLOW;	
        else if (c == 'r') puzz[y][x] = CIRCLE | RED;	
        else if (c == 'g') puzz[y][x] = CIRCLE | GREEN;	
        else if (c == 'b') puzz[y][x] = CIRCLE | BLUE;	
        else if (c == 'y') puzz[y][x] = CIRCLE | YELLOW;	
        else               puzz[y][x] = 0;

        if (puzz[y][x] != 0) symbolCount++;
        //System.out.println("["+x+","+y+"] = "+puzz[y][x]);
      }
    }
    puzz[mover.y][mover.x] |= MARK;
    return true;
  }

  private void popMsg(String title, String msg)
  {
    // need a frame to launch a dialog but all we have is a Canvas
    // search up through the container hierachy until we find a Frame

    Frame f=null;
    Container c = getParent();

    while (c != null && !(c instanceof Frame)) {
      c = c.getParent();
      //System.out.println("parent: "+c);
    } 
    //System.out.println("popMsg: <"+msg+">  frame: "+c);
    if (c == null) return;
    
    Panel p = new Panel();
    p.add(new Label(msg));
    new popUpMessage((Frame)c, title, p);
  }

  public void calcSqSz()
  {
    int k1 = curDim.width/(cols+1);
    int k2 = curDim.height/(rows+1);
    if (k1<k2) sqsz=k1; else sqsz=k2;
    ex=(curDim.width -(sqsz*cols))/2;
    ey=(curDim.height-(sqsz*rows))/2;
  }

  public void myDrawOval(Graphics og, Color c, int x, int y, int w, int h)
  {
    if (c!=null) og.setColor(c);
    og.drawOval(x,y,w,h);
    og.fillOval(x,y,w,h);
  }
  
  public void myDrawRect(Graphics og, Color c, int x, int y, int w, int h)
  {
    if (c!=null) og.setColor(c);
    og.drawRect(x,y,w,h);
    og.fillRect(x,y,w,h);
  }

  public void myDrawCross(Graphics og, Color c, int x, int y, int w, int h)
  {
    if (c!=null) og.setColor(c);
    og.drawLine(x,y,x+w,y+h);
    og.drawLine(x+w,y,x,y+h);

    // make it thicker...
    og.drawLine(x-1,y,x-1+w,y+h);
    og.drawLine(x-1+w,y,x-1,y+h);
    og.drawLine(x+1,y,x+1+w,y+h);
    og.drawLine(x+1+w,y,x+1,y+h);
  }

  public void update(Graphics gc)  
  { 
    Dimension d = getSize();    // canvas size

    // use this opportunity to kick off generation of a new puzzle
    makeSpare();

    if (curDim==null || !curDim.equals(d)) {	
      curDim=d; calcSqSz(); 	// resize
      offScrImg = null; 
    }
    if (sqsz==0) return;        // still 0? give up

    if (offScrImg == null) 
        offScrImg = createImage(curDim.width, curDim.height);
    Graphics og = offScrImg.getGraphics();
  
    og.setColor(getBackground());
    og.fillRect(0, 0, curDim.width, curDim.height);

    // draw the background grid

    og.setColor(Color.lightGray);
    for (int y=0; y<=rows; y++) 
      og.drawLine(ex, ey+(sqsz*y), ex+(sqsz*cols), ey+(sqsz*y));  
    for (int x=0; x<=cols; x++) 
      og.drawLine(ex+(sqsz*x), ey, ex+(sqsz*x), ey+(sqsz*rows));  
    
    int z=sqsz/6, zz=2*z;
    int j=sqsz/3, jj=2*j;

      for (int y=0; y<rows; y++) {
        for (int x=0; x<cols; x++) 
        {
          if ((puzz[y][x] & RED) != 0) og.setColor(Color.red);
          if ((puzz[y][x] & BLUE) != 0) og.setColor(Color.blue);
          if ((puzz[y][x] & GREEN) != 0) og.setColor(Color.green);
          if ((puzz[y][x] & YELLOW) != 0) og.setColor(Color.yellow);
  
          if ((puzz[y][x] & SQUARE) != 0) 
            myDrawRect(og, null, ex+(sqsz*x)+z, ey+(sqsz*y)+z, sqsz-zz, sqsz-zz);
          if ((puzz[y][x] & CIRCLE) != 0) 
            myDrawOval(og, null, ex+(sqsz*x)+z, ey+(sqsz*y)+z, sqsz-zz, sqsz-zz);
          
          if ((puzz[y][x] & MARK) != 0) 
            myDrawCross(og, Color.white, ex+(sqsz*x)+j, ey+(sqsz*y)+j, sqsz-jj, sqsz-jj);
          if (y==mover.y && x==mover.x) 
            myDrawCross(og, Color.black, ex+(sqsz*x)+j, ey+(sqsz*y)+j, sqsz-jj, sqsz-jj);
        }
      }
    gc.drawImage(offScrImg, 0, 0, this);
  }

  public void paint(Graphics gc) { update(gc); }

}

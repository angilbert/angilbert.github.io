import java.awt.*;
import java.awt.font.*;
import java.awt.event.*;
import java.lang.*;
import java.util.*;

// Implements stdpuzz interface - so can be presented by puzzlePresenter class

public class playxvi extends Canvas implements stdPuzz, keyPuzz
{
  public String encStr;			// puzzle encoding - from HTML
  private String titleStr;
  private int bigH,sqsz,rows,cols;
  private Font bigFont,tinyFont;
  private FontMetrics curFM;
  private int padx,pady;		// size of gap round edge
  private int blockers;			// count of blocked squares
  private char puzz[][];		// the puzzle-grid 
  Point mover=null;			// current head-of-path
  Point startp=null;			// start point

  private Image offScrImg;		// used for drawing 'off-screen' 
  Dimension curDim;			// current dimension of drawing area
					
  private boolean haveWon=false;

  static char NESW[] = { 'N','E','S','W' };
  static char IVXL[] = { 'I','V','X','L' };
  static int dx[] = { 0,1,0,-1 };
  static int dy[] = { -1,0,1,0 };
  
  static String seq100 = 
" I II III IV V VI VII VIII IX X XI XII XIII XIV XV XVI XVII XVIII XIX XX XXI XXII XXIII XXIV XXV XXVI XXVII XXVIII XXIX XXX XXXI XXXII XXXIII XXXIV XXXV XXXVI XXXVII XXXVIII XXXIX XL XLI XLII XLIII XLIV XLV XLVI XLVII XLVIII XLIX L LI LII LIII LIV LV LVI LVII LVIII LIX LX LXI LXII LXIII LXIV LXV LXVI LXVII LXVIII LXIX LXX LXXI LXXII LXXIII LXXIV LXXV LXXVI LXXVII LXVIII LXXIX LXXX LXXXI LXXXII LXXXIII LXXXIV LXXXV LXXXVI LXXXVII LXXXVIII LXXXIX XC XCI XCII XCIII XCIV XCV XCVI XCVII XCVIII XCIX C ";

  StringBuffer stepSeq;
  int curNum=0;
  int stepDelta=0, stepCount=0;

  private int dval(char c) {
   if (c=='E') return 1;
   if (c=='S') return 2;
   if (c=='W') return 3;
   return 0;
  }

  // constructors

  public playxvi()			// not used
  { this("sample", "553401323"); }

  // must be public for getConstructor() to find it...

  public playxvi(String s, String e) {
    titleStr = s; encStr = e;
    setBackground(Color.white);
    setForeground(Color.black);
    loadPuzz(true);		// decode and initialise
  }

  // loads of small accessor methods used by puzzlePresenter

  public String puzzType()    { return "XL"; }
  public String puzzAbout()   { return "XL-maze Vn 0.5"; }
  public String puzzConcept() { return "Concept and puzzle (c) Andrea Gilbert 2005"; }
  public boolean wantNEWS()   { return false; }
  public boolean wantLOAD()   { return false; }
  public boolean wantSAVE()   { return false; }
  public boolean wantMARK()   { return false; }
  public boolean animated()   { return false; }
  public Dimension prefSize() { return (new Dimension(400,440)); }
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
t.append ("Step out the sequence of roman numerals (I, II, III, IV, V and so on) ");
t.append ("from 1 to 40 (I to XL). Each step must be to an adjacent square (north, ");
t.append ("south, east or west). Hint, letters can be re-used within the same numeric. ");
t.append ("Start on the central grey square and finish on a grey square at the end ");
t.append ("of each numeric. Use cursor keys to move. Use 'u' to jump-back a whole ");
t.append ("numeric. Once you hit 40, how much higher can you go? ");
     p.add(t);
     return p;
  }

  public void reinit() { restart(); }

  public void restart() {
    haveWon=false;
    loadPuzz(true);
    repaint();
  }

  // here starts the main even handlers
  // called by puzzlePresenter when it detects a mouse click or key-press etc

  public void mouseClick(boolean up, int x, int y) {}
  // { repaint(); return; }

  public boolean keyPress(char c)
  {
    if (c != 'u' && c != 'U') return false;
    if (stepCount==0) return true;

    // unwind move sequence to last blank 

    // if on a blank - we are unwinding a whole numeral
    if (seq100.charAt(stepCount) == ' ') curNum--;
   
    int backup=0;
    do { 
      stepCount--; backup++; 
      mover.x -= dx[dval(stepSeq.charAt(stepCount))];
      mover.y -= dy[dval(stepSeq.charAt(stepCount))];
    } while (seq100.charAt(stepCount) != ' ') ;

    stepSeq.setLength(stepSeq.length()-backup);

    repaint(); 
    return true;
  }

  public void navigate(int fwd) 	// cursor key event
  {
    //System.out.println("navigate:"+fwd+" from:"+mover);

    if (haveWon) return;
    
    int newx = mover.x+dx[fwd];
    int newy = mover.y+dy[fwd];

    if (newx<0 || newy<0 || newx>=cols || newy>=rows) 
	return;		// off grid - ignore

    // if out of sequence - ignore
    if (puzz[newy][newx] != seq100.charAt(stepCount+1)) return;

    mover.x = newx;
    mover.y = newy;
    stepSeq.append(NESW[fwd]);
    stepCount++; stepDelta++;

    if (puzz[newy][newx] == ' ') 
      { curNum++; stepDelta=0; }

    //System.out.println("num="+curNum+" stepSeq=<"+stepSeq.toString()+">");
    //checkForWin();
    repaint(); 
  }

  public boolean checkForWin()
  {
    if (haveWon) return true;
    if (curNum < 100) return false;	// impossible to reach 100!

    haveWon = true;
    popMsg("Win!", "Congratulations");		// impossible

    return true;
  }

  // private methods -------------------------------------------

  // load a puzzle from the encoded string passed through from the HTML
  // return false if we find an encoding error - even though 
  // puzzlePresenter can't cope with this!

  private boolean loadPuzz(boolean logit)
  {
    //System.out.println("loadPuzz: "+encStr);
    if (encStr == null) return false;

    char c = encStr.charAt(0);	// count of columns
    char r = encStr.charAt(1);	// count of rows
    char x = encStr.charAt(2);	
    char y = encStr.charAt(3);	

    if (!Character.isDigit(c)) return false;
    if (!Character.isDigit(r)) return false;
    if (!Character.isDigit(x)) return false;
    if (!Character.isDigit(y)) return false;

    cols=Character.digit(c,16);		
    rows=Character.digit(r,16);
    mover = new Point();
    mover.x=Character.digit(x,16);		
    mover.y=Character.digit(y,16);
    startp = new Point(mover);

    if (rows>16 || cols>16) return false;
    if (rows<2 || cols<2) return false;
    if (encStr.length() < 4+(cols*rows)) return false;
    //System.out.println("rows="+rows+" cols="+cols);
  
    puzz = new char[rows][cols];
    for (int j=0; j<rows; j++) { 
      for (int i=0; i<cols; i++) { 
        puzz[j][i] = encStr.charAt(4+(7*j)+i);	
      } 
    }
    // the puzz array is initialised - we are done

    stepSeq=new StringBuffer("");
    stepDelta=stepCount=0;
    curNum=0;
    return true;
  }

  private void popMsg(String title, String msg)
  {
    // need a frame to launch a dialog but all we have is a Canvas
    // search up through the container hierachy until we find a Frame

    Frame f=null;
    Container c = getParent();

    while (c != null && !(c instanceof Frame)) 
      c = c.getParent();
    if (c == null) return;	// no frame !? - give up
    
    Panel p = new Panel();
    p.add(new Label(msg));
    new popUpMessage((Frame)c, title, p);
  }

  public void calcSqSz(Graphics g)
  {
    // this calculates the optimum size of a grid-square, and
    // the 'left-over' (padx,pady) round the edge
    // should be called at the start and then whenever we detect 
    // the canvas had changed size (user can drag it to grow it)

    int k1 = curDim.width/(cols+1);
    int k2 = curDim.height/(rows+1+2);
    if (k1<k2) sqsz=k1; else sqsz=k2;
    padx=(curDim.width -(sqsz*cols))/2;
    pady=(curDim.height-(sqsz*(rows+2)))/2;

    if (sqsz == 0) return;

    bigFont = new Font("Times New Roman", Font.BOLD, sqsz);
    curFM = g.getFontMetrics(bigFont);
    bigH = curFM.getHeight();
    tinyFont = new Font("Verdana", Font.PLAIN, sqsz/3);

    //System.out.println("calcSqSz: FontMetrics: sqsz="+sqsz+" FM-height="+bigH);
    //System.out.println("Big font: "+bigFont.toString());
    //System.out.println("Little font: "+tinyFont.toString());
  }

  public void myDrawOval(Graphics og, Color c, int x, int y, int w, int h) {
    if (c!=null) og.setColor(c);
    og.drawOval(x,y,w,h);
    og.fillOval(x,y,w,h);
  }
  public void myDrawRect(Graphics og, Color c, int x, int y, int w, int h) {
    if (c!=null) og.setColor(c);
    og.drawRect(x,y,w,h);
    og.fillRect(x,y,w,h);
  }

  public void drawIVXL(Graphics og, char c, int x, int y) {
    if (c=='I') og.drawChars(IVXL,0,1,x,y);
    if (c=='V') og.drawChars(IVXL,1,1,x,y);
    if (c=='X') og.drawChars(IVXL,2,1,x,y);
    if (c=='L') og.drawChars(IVXL,3,1,x,y);
  }

  // the main drawing routine
  // called whenever the JVM thinks a redraw is required
  // (we schedule this ourselves by calling repaint())

  public void update(Graphics gc)  
  { 
    Dimension d = getSize();    // canvas size
    int x, y;

    // if dimension of drawing area not known, or changed
    // recalculate padx, pady & sqsz 

    if (curDim==null || !curDim.equals(d)) {	
      curDim=d; calcSqSz(gc); 	// resize
      offScrImg = null; 
    }
    if (sqsz==0) return;        // still 0? give up

    // using an offscreen image for drawing avoids flicker
    if (offScrImg == null) 
        offScrImg = createImage(curDim.width, curDim.height);
    Graphics og = offScrImg.getGraphics();
  
    // now we can get on with the real drawing...

    og.setColor(getBackground());
    og.fillRect(0, 0, curDim.width, curDim.height);

    int z=sqsz/10, zz=2*z;

    // draw the blank (resting) squares

    og.setColor(Color.gray);
    for (y=0; y<rows; y++) {
      for (x=0; x<cols; x++) { 
        if (puzz[y][x] == ' ')
          myDrawRect(og, null, padx+(sqsz*x), pady+(sqsz*y), sqsz, sqsz);
      }
    }
    og.setColor(Color.lightGray);
    for (int k=0, j=stepCount-3; j<=stepCount+3; k++, j++) {
      if (j<0 || j>seq100.length() || seq100.charAt(j) == ' ') 
        myDrawRect(og, null, padx+(sqsz*k), pady+(sqsz*(rows+1)), sqsz, sqsz);
    }

    // draw the background grid

    og.setColor(Color.black);
    for (y=0; y<=rows; y++) 
      og.drawLine(padx, pady+(sqsz*y), padx+(sqsz*cols), pady+(sqsz*y));  
    for (x=0; x<=cols; x++) 
      og.drawLine(padx+(sqsz*x), pady, padx+(sqsz*x), pady+(sqsz*rows));  

    og.setColor(Color.gray);
    og.drawLine(padx, pady+(sqsz*(rows+1)), padx+(sqsz*cols), pady+(sqsz*(rows+1)));  
    og.drawLine(padx, pady+(sqsz*(rows+2)), padx+(sqsz*cols), pady+(sqsz*(rows+2)));  
    for (x=0; x<=cols; x++) 
      og.drawLine(padx+(sqsz*x), pady+(sqsz*(rows+1)), padx+(sqsz*x), pady+(sqsz*(rows+2)));  
    
    // draw current position

    og.setColor(Color.red);
    og.drawRect(padx+(sqsz*mover.x)+z, pady+(sqsz*mover.y)+z, sqsz-zz, sqsz-zz);
    og.drawRect(padx+(sqsz*3)+z, pady+(sqsz*(rows+1))+z, sqsz-zz, sqsz-zz);

    // draw roman numerals 

    int ex=0, ey=sqsz-(bigH/8); 

    og.setFont(bigFont);
    //System.out.println("Current font (b?): "+og.getFont().toString());
    og.setColor(Color.black);
    for (y=0; y<rows; y++) {
      for (x=0; x<cols; x++) { 
        if (puzz[y][x] != ' ') {
          ex = (sqsz - curFM.charWidth(puzz[y][x]))/2;
          drawIVXL(og, puzz[y][x], padx+(sqsz*x)+ex, pady+(sqsz*y)+ey);
        }
      }
    }

    // and the numerals at the bottom

    og.setColor(Color.gray);
    for (int k=0, j=stepCount-3; j<=stepCount+3; k++, j++) {
      if (!(j<0 || j>seq100.length() || seq100.charAt(j) == ' ')) {
        ex = (sqsz - curFM.charWidth(seq100.charAt(j)))/2;
        drawIVXL(og, seq100.charAt(j), padx+(sqsz*k)+ex, pady+(sqsz*(rows+1))+ey);
      }
    } 

    // and the little decimal progress counter

    ex=sqsz/5; ey=sqsz-(sqsz/6); 

    if (seq100.charAt(stepCount) == ' ') {
      og.setFont(tinyFont);
      og.setColor(Color.red);
      //System.out.println("Current font (t?): "+og.getFont().toString());
      String s = new String(""+curNum+"");
      og.drawString(s, padx+(sqsz*3)+ex, pady+(sqsz*(rows+1))+ey);
      og.drawString(s, padx+(sqsz*mover.x)+ex, pady+(sqsz*mover.y)+ey);
    }

    // blat the off-screen image to screen
    gc.drawImage(offScrImg, 0, 0, this);
  }

  public void paint(Graphics gc) { update(gc); }
}

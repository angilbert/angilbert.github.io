import java.awt.*;
import java.awt.event.*;
import java.lang.*;
import java.util.*;
import java.awt.geom.Line2D;

// An example of a puzzle that can be presented by puzzlePresenter
// also implements the keyPuzz interface because it wants to know
// about key events.

public class polyfold extends Canvas implements stdPuzz, keyPuzz, mmovePuzz
{
  private boolean haveWon=false;
  private String titleStr, encStr;
  private StringBuffer curMoves;
  private Image offScrImg;
  private Vector polyShapes;
  private Shape mover;
  Dimension curDim;
  private boolean toggle=true;
  private popUpMessage popup;
  
  // constructors

  public polyfold()
  {
    this("sample", "50,50:50,-50:-50,-50:-50,50");
  }

  // must be public for getConstructor() to find it...

  public polyfold(String s, String e)
  {
    titleStr = s;
    encStr = e;
    curMoves=new StringBuffer();
    setBackground(Color.white);
    setForeground(Color.black);

    loadPuzz();		// decode and initialise
  }

  public String puzzType()    { return "Polyfold"; }
  public String puzzAbout()   { return "Polyfold Version 1.0"; }
  public String puzzConcept() { return "Concept by Oskar van Deventer (1988)"; }
  public boolean wantNEWS()   { return false; }
  public boolean animated()   { return false; }
  public Dimension prefSize() { return (new Dimension(600,600)); }
  public boolean resizeOK()   { return true; }
  public String title()       { return titleStr; }
  public Canvas getCanvas()   { return(this); }
  public void returnFocus()   { requestFocus(); }
  public void abort()         {}
  public void navigate(int d) {}

  public boolean setSeq(String moves) { return false; }
  public String getSeq()              { return null; }

  public void reinit()
  { 
    restart();
  }

  public Panel getRules()  
  { 
     Panel p = new Panel();

     TextArea t = new TextArea("", 8, 40, TextArea.SCROLLBARS_VERTICAL_ONLY);
t.append("Fold the blue shape by clicking on its corners to solve the various ");
t.append("challenges. The aim is to grey out all the red and green shapes. A ");
t.append("green shape will grey out as soon as you form a matching shape ");
t.append("in the same orientation anywhere in the play area. A red ");
t.append("box will grey out once it completely contains the blue shape. ");
t.append("Black lines are blockers, the blue shape cannot intersect black.\n\n");
t.append("Press 'c' to re-centre the current image.\n");
t.append("Press 't' to toggle on/off the dashed fold lines. \n");
t.append("Press SPACE to reset the current puzzle.");
     t.setEditable(false);
     p.add(t);
     return p;
  }

  public void restart()
  {
    haveWon=false;
    curMoves.setLength(0);
    for (int j=0; j<polyShapes.size(); j++) {
      Shape s = (Shape) polyShapes.elementAt(j);
      s.reinit();
    }
    repaint();
  }

  public void mouseClick(boolean upFlag, int x, int y) 
  {
    if (!upFlag || x<0 || y<0) return;

    if (popup != null) { popup.dispose(); popup = null; }

    if (mover.findCorner(true,polyShapes,x,y)) {
    	repaint(); 
        checkForWin();
    }
  }

  public void mouseMove(int x, int y) 
  {
    if (x<0 || y<0) return;

    if (mover.findCorner(false,polyShapes,x,y)) {
    	repaint(); 
    }
  }

  public boolean checkForWin() 
  { 
    if (haveWon == true) return true;

    boolean newGoal=false;
    int goals=0, got=0;

    for (int j=0; j<polyShapes.size(); j++) 
    {
      Shape s = (Shape) polyShapes.elementAt(j);

      if (s.isGoal()) { 	// not used
	if (mover.overlays(s,0,0) && s.overlays(mover,0,0)) {
          if (!s.isReached()) newGoal=true;
	  s.setReached(); 
        }
      }
      else if (s.isShapeGoal()) { 
	if (mover.looksSame(s) && s.looksSame(mover)) {
          if (!s.isReached()) newGoal=true;
	  s.setReached(); 
        }
      }
      else if (s.isBoxGoal()) { 
	if (mover.inBox(s)) {
          if (!s.isReached()) newGoal=true;
	  s.setReached(); 
        }
      }
      else continue;

      if (s.isReached()) got++;
      goals++;
    }
    if (goals == 0) return false;	// non-goal puzzle
    if (!newGoal) return false;

    if (got < goals) {
      popMsg("well done", ""+(goals-got)+" more to go!");
      return false;
    }
    
    popMsg("win!", "Congratulations!!");
    haveWon = true;
    return true;
  }


  public boolean keyPress(char c)
  {
    if (c == 'c') {
      curDim = null;
      repaint(); return true;
    }
    if (c == 'd') {
      String e = mover.getEncStr();
      Shape s = new Shape(Shape.DECOR|Shape.CLOSED, e);
      polyShapes.addElement(s);
      repaint(); return true;
    }
    /*if (c == '+') {
      zoom(true); repaint(); return true;
    }
    if (c == '-') {
      zoom(false); repaint(); return true;
    }*/
    if (c == 't') {
      toggle = !toggle; return true;
    }
    if (c == '?') {
      Panel p = new Panel(); 
      TextArea t = new TextArea("", 8, 40, TextArea.SCROLLBARS_VERTICAL_ONLY);
      t.append("Current shapes... \n");

      for (int j=0; j<polyShapes.size(); j++) {
        Shape s = (Shape) polyShapes.elementAt(j);
        t.append(s.getEncStr()+"\n");
      }
      t.setEditable(false);
      p.add(t);

      popup = new popUpMessage(getFrame(), "Points", p);
      return true;
    }
    return false;	// not one for us
  }

  // private methods -------------------------------------------

  private boolean loadPuzz()
  {
    String typeStr, polyStr;
    StringTokenizer tk;
    int type=0;

    polyShapes = new Vector();
    sPoint p;

    tk = new StringTokenizer(encStr,"+");
    while (tk.hasMoreTokens()) 
    {
      try {
        typeStr = tk.nextToken().trim();
        polyStr = tk.nextToken().trim();
        System.out.println("shape:"+polyStr+" ("+typeStr+")");
  
        if (typeStr.equals("M")) type = Shape.MOVER | Shape.CLOSED;
        if (typeStr.equals("m")) type = Shape.MOVER;
        if (typeStr.equals("W")) type = Shape.WALL | Shape.CLOSED;
        if (typeStr.equals("w")) type = Shape.WALL;
        if (typeStr.equals("D")) type = Shape.DECOR | Shape.CLOSED;
        if (typeStr.equals("d")) type = Shape.DECOR;
        if (typeStr.equals("S")) type = Shape.SGOAL | Shape.CLOSED;
        if (typeStr.equals("s")) type = Shape.SGOAL;
        if (typeStr.equals("B")) type = Shape.BGOAL | Shape.CLOSED;
        
        if (type==0) {
          System.out.println("Type must be one of MmWwGgDdZ");
          return false;
        }
        Shape s = new Shape(type, polyStr);
        if (s.isMover()) mover = s;
        polyShapes.addElement(s);
      } 
      catch (NoSuchElementException e) {
        System.out.println("Each shape must be encoded: +<type>+<points>+");
        return false;
      }
    }
    curDim = null;	// forces a recentre - if not disabled
    return true;
  }

  private Frame getFrame()
  {
    // search up through the container hierachy until we find a Frame

    Container c = getParent();
    while (c != null && !(c instanceof Frame)) 
      c = c.getParent();
    return ((Frame)c);
  }

  private void popMsg(String title, String msg)
  {
    Panel p = new Panel();
    p.add(new Label(msg));
    popup = new popUpMessage(getFrame(), title, p);
  }

  private void zoom(boolean z)
  {
    for (int j=0; j<polyShapes.size(); j++) {
      Shape s = (Shape) polyShapes.elementAt(j);
      s.zoom(z);
    }
    curDim=null;
  }

  private void reCentre()
  {
    Point min = new Point(10000, 10000);
    Point max = new Point(0, 0);
   
    for (int j=0; j<polyShapes.size(); j++) {
      Shape s = (Shape) polyShapes.elementAt(j);
      s.setBounds(min, max);
    }
    int cx = (max.x+min.x)/2;
    int cy = (max.y+min.y)/2;
    //System.out.println("Centre image="+cx+","+cy+" based on:"+curDim);

    int shiftx = curDim.width/2 - cx;
    int shifty = curDim.height/2 - cy;

    for (int j=0; j<polyShapes.size(); j++) {
      Shape s = (Shape) polyShapes.elementAt(j);
      s.shift(shiftx, shifty);
    }
  }

  public void update(Graphics gc)  
  { 
    Dimension newDim = getSize();    	// canvas size
    if (newDim.width==0) return;      

    if (curDim==null || !newDim.equals(curDim)) { 
      curDim = newDim;
      reCentre(); 
      offScrImg = createImage(curDim.width, curDim.height);
    }

    Graphics og = offScrImg.getGraphics();
    og.setColor(getBackground());
    og.fillRect(0, 0, curDim.width, curDim.height);

    //if (!haveWon) {
      for (int j=0; j<polyShapes.size(); j++) {
        Shape s = (Shape) polyShapes.elementAt(j);
        if (!s.isMover()) s.drawMe(og);
      }
    //}
    mover.drawMe(og);	// make sure drawn last
    
    // draw image
    gc.drawImage(offScrImg, 0, 0, this);
  }
  public void paint(Graphics gc) { update(gc); }


  // private classes -------------------------------------------------------

  private class Shape 
  {
    Point minXY, maxXY;
    private Vector vx1, vx;
    boolean reached=false;
    int type;

    public Polygon myPoly;

    final static int CLOSED	= 0x01;
    final static int MOVER	= 0x02;
    final static int GOAL  	= 0x04;	// not used
    final static int WALL 	= 0x08;
    final static int DECOR 	= 0x10;
    final static int SGOAL 	= 0x20;
    final static int BGOAL 	= 0x40;

    Shape(int t, String e)
    {
      type = t;
      vx = new Vector();
      vx1 = new Vector();	// start locale
       
      loadMe(vx1, new String(e));
      reinit();

      loadPoly();
    }

    public boolean isMover()  { return((type & MOVER) != 0); }
    public boolean isGoal()   { return((type & GOAL) != 0); }	// not used
    public boolean isShapeGoal()   { return((type & SGOAL) != 0); }
    public boolean isBoxGoal()   { return((type & BGOAL) != 0); }
    public boolean isWall()   { return((type & WALL) != 0); }
    public boolean isClosed() { return((type & CLOSED) != 0); }
    public boolean isDecor()  { return((type & DECOR) != 0); }

    public boolean isReached() { return reached; }
    public void setReached()   { reached = true; }

    public void listPoints(TextArea t) 
     {
      for (int i=0; i<vx.size(); i++) {
        sPoint p = (sPoint) vx.elementAt(i);
        t.append(p.toString()+"\n");
      }
    }

    public void loadPoly()
    {
      myPoly = new Polygon();
      for (int i=0; i<vx.size(); i++) {
        sPoint p = (sPoint) vx.elementAt(i);
        myPoly.addPoint(p.x, p.y);
      }
      minXY = new Point(10000, 10000);
      maxXY = new Point(0, 0);
      setBounds(minXY, maxXY);

      //System.out.println("poly point count: "+myPoly.npoints);
    }

    public void reinit()
    {
      // create a brand new vx - based on current vx1
      vx = new Vector();
      for (int i=0; i<vx1.size(); i++) {
        sPoint p = (sPoint) vx1.elementAt(i); 
        vx.addElement(new sPoint(p.x,p.y));
      }
      reached=false;
    }

    private boolean inRange(int x, int y)
    {
      if (x<0 || y<0 || x>1000 || y>1000) {
        System.out.println("Each point should be in range 0,0 to 1000,1000");
        return false;
      } return true;
    }

    private boolean loadMe(Vector v, String s)
    {
      Integer Ix,Iy;
      int x1,x2,y1,y2;
      StringTokenizer tk;
  
      tk = new StringTokenizer(s,":,");
  
      try {
        while (tk.hasMoreTokens()) 
        {
          Ix = new Integer(tk.nextToken());
          Iy = new Integer(tk.nextToken());
          x1 = Ix.intValue(); 
          y1 = Iy.intValue(); 
          if (!inRange(x1,y1)) return false;
      
          v.addElement(new sPoint(x1,y1));
        }
      } 
      catch (NoSuchElementException e) {
        System.out.println("Bad point string");
        return false; }
      catch (NumberFormatException e) {
        System.out.println("Non-numeric found in points string");
        return false; }
      return true;
    }

    private boolean setFold(Vector allShapes, int i)
    {
      if (i<0 || i>=vx.size()) return false;
      
      int a=i-1; 		// index of adjacent point A
      int b=i+1;		// index of adjacent point B
  
      if (isClosed()) {
        if (a<0) a=vx.size()-1;
        if (b==vx.size()) b=0;
      }
      else {
        if (a<0) a=b;
        if (b==vx.size()) b=a;
      }

      sPoint p = (sPoint) vx.elementAt(i);
      sPoint Ap = (sPoint) vx.elementAt(a);
      sPoint Bp = (sPoint) vx.elementAt(b);
      
      boolean rtn = p.setFoldPoint(Ap, Bp);
      if (rtn == false) return false;		// no change
     
      sPoint Qp = p.getFoldPoint();
      for (int j=0; j<allShapes.size(); j++) {
        Shape s = (Shape) allShapes.elementAt(j);
        if (s==this || !s.isWall()) continue;
        if (s.intersects(Ap, Qp) || s.intersects(Bp, Qp)) 
          p.gradeFold(false);
      }
      return true;
    }

    public boolean findCorner(boolean foldNow, Vector s, int x, int y) 
    {
      boolean rtn=false;
      int total=0, goodtotal=0;
      boolean clearFolds=false;

      // find the nearest corner

      for (int i=0; i<vx.size(); i++) 
      {
        sPoint p = (sPoint) vx.elementAt(i);
        if (p.closeTo(x,y) == true) {
          total++; setFold(s,i); 
          if (p.goodFold()==true) goodtotal++;
        } 
        else if (p.clearFoldPoint() == true) clearFolds=true;
      }

      if (total==0) return clearFolds;		// no match
      if (!foldNow) return true;

      // apply all good folds
      // don't winge unless all folds are blocked

      if (goodtotal == 0)
	popMsg("Error", "Fold blocked by wall");

      else for (int i=0; i<vx.size(); i++) {
        sPoint p = (sPoint) vx.elementAt(i);
        p.applyFoldPoint();
      }
      return true;
    }

    public void zoom(boolean z) {
      for (int i=0; i<vx.size(); i++) {
        sPoint p = (sPoint) vx.elementAt(i); 
        if (z==true) p.zoomIn(); else p.zoomOut();
        p = (sPoint) vx1.elementAt(i); 
        if (z==true) p.zoomIn(); else p.zoomOut();
      }
      minXY = new Point(10000, 10000);
      maxXY = new Point(0, 0);
      setBounds(minXY, maxXY);
    }

    public void shift(int x, int y) {
      sPoint p;
      for (int i=0; i<vx.size(); i++) {
        p = (sPoint) vx.elementAt(i); p.translate(x,y);
        p = (sPoint) vx1.elementAt(i); p.translate(x,y);
      }
      minXY = new Point(10000, 10000);
      maxXY = new Point(0, 0);
      setBounds(minXY, maxXY);
    }

    public void setBounds(Point min, Point max) {
      for (int i=0; i<vx.size(); i++) {
        sPoint p = (sPoint) vx.elementAt(i);
        p.setBounds(min,max);
      }
      //System.out.println("setBounds: min:"+min+" max:"+max);
    }

    public boolean includes(sPoint dp)
    {
      for (int i=0; i<vx.size(); i++) {
        sPoint p = (sPoint) vx.elementAt(i);
        if (p.equals(dp)) return true;
      }
      return false;
    }

    public String getEncStr()
    {
      StringBuffer sb = new StringBuffer();
      for (int i=0; i<vx.size(); i++) {
        if (i>0) sb.append(":");
        sPoint p = (sPoint) vx.elementAt(i);
        sb.append(p.x+","+p.y);
      }
      //System.out.println("getEncStr: "+sb.toString());
      return sb.toString();
    }

    /*public Vector reCentreOn(sPoint p)
    {
      int cx = (maxXY.x+minXY.x)/2;
      int cy = (maxXY.y+minXY.y)/2;
      int shiftx = p.x - cx;
      int shifty = p.y - cy;

      Vector v = (Vector) vx.clone();
      vshift(shiftx, shifty);
    } */

    public sPoint getp(int i) {
      return((sPoint)vx.elementAt(i));
    }

    public boolean inBox(Shape box)
    {
      // check all points fall within bounds of box

      for (int i=0; i<vx.size(); i++) {
        sPoint p = (sPoint) vx.elementAt(i);
        if (p.x<box.minXY.x || p.y<box.minXY.y) return false;
        if (p.x>box.maxXY.x || p.y>box.maxXY.y) return false;
        //System.out.println("inBox... point:"+p);
      }
      return true;
    }

    public boolean looksSame(Shape other)
    {
      sPoint q = (sPoint) other.getp(0);

      for (int i=0; i<vx.size(); i++) {
        sPoint p = (sPoint) vx.elementAt(i);
        if (overlays(other, q.x-p.x, q.y-p.y)) return true;
      }
      return false;
    }

    public boolean overlays(Shape other, int dx, int dy)
    {
      int count=0, i=0;
      for (i=0; i<vx.size(); i++) {
        sPoint p = (sPoint) vx.elementAt(i);
        sPoint q = new sPoint (p.x+dx, p.y+dy);
        if (other.includes(q)) count++;
      }
      if (count < vx.size()) return false;
      
      // need to do the reverse check to ensure complete overlay
      //return (other.overlays(this, -dx, -dy));
      return true;
    }
    
    public boolean intersects(sPoint dp1, sPoint dp2) 
    {
      // check whether current shape intersects the line defined
      // by dp1 -> dp2. Use 2DLine to do this.

      if (!isWall()) return false;

      Line2D.Double a1, a2;
      sPoint p1,p2;

      a1 = new Line2D.Double(dp1.x, dp1.y, dp2.x, dp2.y);

      for (int i=0; i<vx.size()-1; i++) {
        p1 = (sPoint) vx.elementAt(i);
        p2 = (sPoint) vx.elementAt(i+1);

        if (p1.equals(dp1) || p1.equals(dp2)) return true;
        if (p2.equals(dp1) || p2.equals(dp2)) return true;

        a2 = new Line2D.Double(p1.x, p1.y, p2.x, p2.y);
        if (a1.intersectsLine(a2)) return true;
      }
      if (isClosed()) {
        p1 = (sPoint) vx.elementAt(0);
        p2 = (sPoint) vx.elementAt(vx.size()-1);
        a2 = new Line2D.Double(p1.x, p1.y, p2.x, p2.y);
        if (a1.intersectsLine(a2)) return true;
      }
      return false;
    }
    
    private void drawDottedLine(Graphics og, sPoint p1, sPoint p2)
    {
      // First draw the line - then super impose white circles
      // to create a dotted effect.

      og.drawLine(p1.x,p1.y,p2.x,p2.y);

      int dx = (p2.x-p1.x);
      int dy = (p2.y-p1.y);

      int len = (int) Math.pow(((dx*dx)+(dy*dy)), 0.5);
      int dz = len/8;

      dx = (p2.x-p1.x)/5; 
      dy = (p2.y-p1.y)/5; 

      og.setColor(Color.white);
      for (int i=1; i<5; i++) 
        og.fillOval(p1.x+(dx*i)-dz/2,p1.y+(dy*i)-dz/2,dz,dz);
    }

    private void drawSector(Color c, Graphics og, sPoint p1, sPoint p2, 
				boolean dotted, boolean cornerMarks)
    { 
      //System.out.println("drawLine: "+p1.toString()+" -> "+p2.toString());

      og.setColor(c);
      og.drawLine(p1.x,p1.y,p2.x,p2.y);

      if (dotted) drawDottedLine(og,p1,p2);
      else        og.drawLine(p1.x,p1.y,p2.x,p2.y);

      if (cornerMarks) {
        og.drawOval(p1.x-6,p1.y-6,12,12);
        og.drawOval(p2.x-6,p2.y-6,12,12);
      }

      if (!isMover() || toggle==false) return;

      sPoint fp;
      og.setColor(Color.blue);
      //if ((fp = p1.getFoldPoint()) != null) og.drawLine(fp.x,fp.y,p2.x,p2.y);
      //if ((fp = p2.getFoldPoint()) != null) og.drawLine(fp.x,fp.y,p1.x,p1.y);
      if ((fp = p1.getFoldPoint()) != null) drawDottedLine(og,fp,p2);
      if ((fp = p2.getFoldPoint()) != null) drawDottedLine(og,fp,p1);
    }

    public void drawMe(Graphics og)  
    { 
      //if (isGoal() & reached) return;
      //if (isShapeGoal() & reached) return;
      //if (isBoxGoal() & reached) return;

      int i;
      sPoint p1, p2, p3;
      Color col = Color.blue;
  
      // if the MOVER - first draw its start location

      if (isMover()) 
      {
        for (i=0; i<vx1.size()-1; i++) {
          p1 = (sPoint) vx1.elementAt(i);
          p2 = (sPoint) vx1.elementAt(i+1);
          drawSector(Color.lightGray, og, p1, p2, false, false);
        }
        if (isClosed()) {
          p1 = (sPoint) vx1.elementAt(vx.size()-1);
          p2 = (sPoint) vx1.elementAt(0);
          drawSector(Color.lightGray, og, p1, p2, false, false);
        }
      }

      og.setColor(Color.lightGray);

      if (isBoxGoal()) {
        if (!reached) og.setColor(Color.red);
        p1 = (sPoint) vx.elementAt(0);
        p2 = (sPoint) vx.elementAt(1);
        p3 = (sPoint) vx.elementAt(vx.size()-1);
        //assumes points are defined clockwise from top-left...
        og.drawRect(p1.x,p1.y,p2.x-p1.x,p3.y-p1.y);
        //og.fillRect(p1.x,p1.y,p2.x-p1.x,p3.y-p1.y);
	return;
      }

      boolean dotted=false;
      if (isWall()) col = Color.black;
      if (isShapeGoal()) col = Color.green;
      if (isDecor()) col = Color.lightGray;
      if (reached) col = Color.lightGray;

      for (i=0; i<vx.size()-1; i++) {
        p1 = (sPoint) vx.elementAt(i);
        p2 = (sPoint) vx.elementAt(i+1);
        drawSector(col, og, p1, p2, dotted, isMover());
      }
      if (isClosed()) {
        p1 = (sPoint) vx.elementAt(vx.size()-1);
        p2 = (sPoint) vx.elementAt(0);
        drawSector(col, og, p1, p2, dotted, false);
      }
    }
  }

  private class sPoint extends Point
  {
    sPoint foldPoint;
    boolean okFold=true;

    sPoint (int nx, int ny) { super(nx,ny); }

    public boolean closeTo(int ix, int iy) {
      int zx=ix-x, zy=iy-y;
      if (zx<9 && zx>-9 && zy<9 && zy>-9) return true;
      return false;
    }

    public void gradeFold(boolean ok) { okFold = ok; } 
    public boolean goodFold() { return okFold; }
    public sPoint getFoldPoint() { return foldPoint; }

    public boolean clearFoldPoint() { 
      boolean rtn = false;
      if (foldPoint != null) rtn = true;
	  foldPoint=null; 
	  return rtn;
    }

    public boolean setFoldPoint(sPoint Ap, sPoint Bp) 
    {
      int Qx = (Bp.x + Ap.x - x);
      int Qy = (Bp.y + Ap.y - y);
      sPoint p = new sPoint(Qx,Qy);

      if (foldPoint != null 
	&& Qx == foldPoint.x 
	&& Qy == foldPoint.y) return false;

      foldPoint = p;
      okFold = true;	// assume OK for now
      return true;	// update needed
    }

    public boolean applyFoldPoint() 
    { 
      if (foldPoint == null) return true;	// no change
      if (!okFold) return false;

      x = foldPoint.x;
      y = foldPoint.y;
      foldPoint=null; 
      return true;
    }

    //public sPoint clone() { return new sPoint(x,y); }

    public void zoomIn() { x*=2; y*=2; }
    public void zoomOut() { x/=2; y/=2; }

    public void setBounds(Point min, Point max) {
      if (x > max.x) max.x = x; 
      if (y > max.y) max.y = y;
      if (x < min.x) min.x = x; 
      if (y < min.y) min.y = y;
      //System.out.println("setBounds for sPoint: "+this);
    }
  }
}


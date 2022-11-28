//import javax.swing.*;
//import java.io.*;
//import javax.sound.sampled.*;
import java.awt.*;
import java.applet.*;
import java.awt.event.*;
import java.net.*;
// import java.util.StringTokenizer;

public class Jukebox extends Applet implements ActionListener {
    Button startbutton = new Button(" Click here to play ");
    JukeboxPanel jukeboxPanel=null;
    Sound sound;
    JukeboxFrame frame=null;

    public void init() {
        sound=new Sound(this);
        startbutton.addActionListener(this);
        setLayout(new GridLayout(1,1));
        add(startbutton);
    }

    public void start() {
    }

    public void stop() {
        Sound.stop();
        if(frame!=null) frame.dispose();
        if(jukeboxPanel!=null){
                jukeboxPanel.controls.runner=null;
            jukeboxPanel=null;
        }
        DrawPanel.drawPanel=null;
        Switch.first=null;
        Disk.first=null;
        StartDot.first=null;
    }

    public void actionPerformed(ActionEvent evt) {
        Object source = evt.getSource();
        if (source == startbutton){
            stop();
            jukeboxPanel=new JukeboxPanel();
            frame = new JukeboxFrame("Jukebox");
            frame.addWindowListener(frame);
            frame.setBounds(20,20,490,750);
            frame.setLayout(new GridLayout(1,1));
            frame.add(jukeboxPanel);
            frame.show();
        }
    }
}

class JukeboxFrame extends Frame implements WindowListener{
    JukeboxFrame(String string){
        super(string);
    }
    public void windowActivated (WindowEvent evt) {}
    public void windowClosed (WindowEvent evt) {}
    public void windowDeactivated (WindowEvent evt) {}
    public void windowDeiconified (WindowEvent evt) {}
    public void windowIconified (WindowEvent evt) {}
    public void windowOpened (WindowEvent evt) {}
    public void windowClosing (WindowEvent evt) {
        Sound.stop();
        this.dispose();
    }
}

class JukeboxPanel extends Panel{
    Button reset             =new Button("Reset (r)");
    Button start             =new Button("Start: No.1 (s)");
    Button previous          =new Button("Previous (p)");
    Button next              =new Button("Next (n)");
    Choice choice            =new Choice();
    Scrollbar slider         =new Scrollbar(Scrollbar.HORIZONTAL);
    DrawPanel drawPanel      =new DrawPanel(this);
    JukeboxControls controls;
    

    JukeboxPanel(){
        int number=12;
        for(int i=1;i<number+1;i++){
            choice.add(Sound.musicNames[i]);
        }
        choice.select(9);
        slider.setValues(3,1,0,7);
        slider.setBlockIncrement(1);

        controls=new JukeboxControls(this);

        // Adding the listeners
        reset.addActionListener(controls);
        start.addActionListener(controls);
        previous.addActionListener(controls);
        next.addActionListener(controls);
        choice.addItemListener(controls);
        slider.addAdjustmentListener(controls);
        drawPanel.addMouseListener(controls);
        start.addKeyListener(controls);
        previous.addKeyListener(controls);
        next.addKeyListener(controls);
        reset.addKeyListener(controls);
        choice.addKeyListener(controls);
        slider.addKeyListener(controls);
        drawPanel.addKeyListener(controls);

        // South panel
        Panel southPanel=new Panel();
        southPanel.setLayout(new GridLayout(2,3));
        southPanel.add(start);
        southPanel.add(previous);
        southPanel.add(next);
        southPanel.add(reset);
        southPanel.add(choice);
        southPanel.add(slider);

        // Jukebox panel
        setLayout(new BorderLayout());
        add("Center",drawPanel);
        add("North",southPanel);
        drawPanel.repaint();

    }
}

//------------------------------------------------------------
class JukeboxControls implements ActionListener, AdjustmentListener, KeyListener, ItemListener, MouseListener, Runnable {
    JukeboxPanel parent;
    int challengeNumber;
    Thread runner=null;
    int delay=1;            // Sleep time for animation

    JukeboxControls(JukeboxPanel parent){
        this.parent=parent;
        setChallenge();
    }

    void setChallenge(){
        runner=null;
        challengeNumber=parent.choice.getSelectedIndex()+1;
        Challenge.setChallenge(challengeNumber);
        parent.reset.setLabel("Reset No."+(challengeNumber)+" (r)");
        if(challengeNumber==1){
            parent.previous.setEnabled(false);
            parent.start.setEnabled(false);
        }
        else {
            parent.previous.setEnabled(true);
            parent.start.setEnabled(true);
        }
        if(challengeNumber==parent.choice.getItemCount())
            parent.next.setEnabled(false);
        else
            parent.next.setEnabled(true);
        parent.reset.setEnabled(false);
        setDelay(parent.slider.getValue());
        DrawPanel.drawPanel.requestFocus();
        runner=new Thread(this);
        runner.start();
    }

    public void run(){
        Thread thisThread=Thread.currentThread();
        while(runner==thisThread){
            update();
            try{
                Thread.sleep(delay);
            } catch(InterruptedException e) {}
        }
    }

    public void reset(){
        setChallenge();
    }

    public void start(){
        parent.choice.select(0);
        setChallenge();
    }

    public void previous(){
        int nr= parent.choice.getSelectedIndex()-1;
        if(nr>=0){
            parent.choice.select(nr);
            setChallenge();
        }
    }

    public void next(){
        int nr= parent.choice.getSelectedIndex()+1;
        if(nr< parent.choice.getItemCount()){
            parent.choice.select(nr);
            setChallenge();
        }
    }


    public void keyTyped(KeyEvent evt){}
    public void keyReleased(KeyEvent evt){}
    public void keyPressed(KeyEvent evt){
        int keyCode = evt.getKeyCode();
        int toets = evt.getKeyChar();
        char letter = (char) toets;
        int number=(int)letter-48;

        StartDot.pressedAt(number);
        if((keyCode==37)||(keyCode==39))  // 37=left, 39=right
            StartDot.keyAt(keyCode);
        if(letter=='r')reset();
        else if(letter=='s')start();
        else if(letter=='p')previous();
        else if(letter=='n')next();
        else if(letter==' ')update();
        if(StartDot.started){
            parent.reset.setEnabled(true);
            parent.start.setEnabled(true);
            DrawPanel.drawPanel.requestFocus();
        }

    }

    public void mouseClicked(MouseEvent evt) {}
    public void mouseEntered(MouseEvent evt) {}
    public void mouseExited(MouseEvent evt) {}
    public void mousePressed(MouseEvent evt) {}
    public void mouseReleased(MouseEvent evt) {
        Object source = evt.getSource();
        StartDot.clickedAt(evt.getPoint());
        if(StartDot.started){
            parent.reset.setEnabled(true);
            parent.start.setEnabled(true);
            DrawPanel.drawPanel.requestFocus();
        }
        DrawPanel.repaintAll();
    }


    public void actionPerformed(ActionEvent evt){
        Object source=evt.getSource();
        if(source==parent.reset)reset();
        else if(source==parent.start)start();
        else if(source==parent.previous)previous();
        else if(source==parent.next)next();
    }

    public void itemStateChanged(ItemEvent evt){
        setChallenge();
    }

    public void adjustmentValueChanged(AdjustmentEvent evt){
        setDelay(evt.getValue());
        DrawPanel.drawPanel.requestFocus();
    }

    // Method that updates the jukebox and repaints it
    void update(){
        Disk.updateAll();
        StartDot.updateAll();
        Switch.updateAll();
        DrawPanel.repaintAll();
//        if(Disk.stable()&&Switch.stable())
//            runner=null;
    }

    // Method that sets the delay value
    void setDelay(int sliderValue){
        if(sliderValue==0) delay=100;
        if(sliderValue==1) delay=50;
        if(sliderValue==2) delay=20;
        if(sliderValue==3) delay=10;
        if(sliderValue==4) delay=5;
        if(sliderValue==5) delay=2;
        if(sliderValue==6) delay=0;
    }

}

//------------------------------------------------------------
class DrawPanel extends Panel {
    static DrawPanel drawPanel=null;
    Image offScreenImage = null;
    JukeboxPanel parent;
    Color backgroundColor=Color.white;
    Graphics canvas;

    DrawPanel(JukeboxPanel parent){
        this.parent=parent;
        drawPanel=this;
        setBackground(backgroundColor);

    }

    // Method to paint THE Drawpanel
    static public void repaintAll(){
        DrawPanel drawPanel=DrawPanel.drawPanel;
        if(drawPanel!=null){
            drawPanel.backgroundColor=(Color.white);
            DrawPanel.drawPanel.repaint();
        }
    }

    // Method to paint this Drawpanel
    public void paint(Graphics gc) {update(gc);}

    public void update(Graphics gc) {
        if (offScreenImage==null) offScreenImage = createImage(1000,1000);
        canvas=offScreenImage.getGraphics();
        canvas.setColor(backgroundColor);
        canvas.fillRect(0,0,1000,1000);
        Switch.paintAll(canvas);
        Disk.paintAll(canvas);
        JukeboxParts.paintAll(canvas);
        gc.drawImage(offScreenImage, 0, 0, this);
    }

}


//------------------------------------------------------------
class Dot {
    double x,y;      // Coordinates of center of dot
    Dot next=null;   // Pointing to the next dot
    Polygon poly;    // Polygon for drawing a disk on the dot
    Dot dot1,dot2;   // Two dots that this dot could be connected to
    static final int diam=20;     // Diameter of the disk (pixels)

    Dot(double x, double y){
        this.x=x;
        this.y=y;
        int num=360/6;  // 6 degrees angle
        int[] xx=new int[num+1];
        int[] yy=new int[num+1];
        for(int i=0;i<num+1;i++){
            xx[i]=(int)Math.round(x+(diam/2)*Math.cos(2*Math.PI*i/num));
            yy[i]=(int)Math.round(y+(diam/2)*Math.sin(2*Math.PI*i/num));
        }
        poly=new Polygon(xx,yy,num+1);
    }

    // Linking this dot to toDot
    void link(Dot toDot){
        double distance= distance(toDot.x,toDot.y);
        int steps=(int)Math.floor(distance/2);
        if(steps<1){next=toDot;}
        else{
            Dot tempFrom=this;
            double deltax=(toDot.x-x)/(steps);
            double deltay=(toDot.y-y)/(steps);
            for(int i=1;i<steps;i++){
                Dot tempTo=new Dot((x+i*deltax),(y+i*deltay));
                tempFrom.next=tempTo;
                tempFrom=tempTo;
            }
            tempFrom.next=toDot;
        }
    }

    // Linking this dot to toDot with an arch
    void linkRound(Dot toDot){
        double distance= distance(toDot.x,toDot.y);
        int steps=(int)Math.floor(distance/2);
        if(steps<1){next=toDot;}
        else{
            Dot tempFrom=this;
            double deltax=toDot.x-x;
            double deltay=toDot.y-y;
            for(int i=1;i<steps;i++){
                double alpha=i*Math.PI/(2*steps);
                double newx= x+Math.sin(alpha)*deltax;
                double newy= y+(1-Math.cos(alpha))*deltay;
                Dot tempTo=new Dot(newx,newy);
                tempFrom.next=tempTo;
                tempFrom=tempTo;
            }
            tempFrom.next=toDot;
        }
    }

    // Calculating the desitance between this dot and x2,y2
    double distance(double x2, double y2){
        return Math.pow(((x2-x)*(x2-x)+(y2-y)*(y2-y)),0.5);
    }

    // Check whether this disk is sufficiently far away from a given Disk
    boolean farEnoughFrom(Disk disk){
        double distance=distance(disk.dot.x,disk.dot.y);
        return (distance>20); // Minimum distance between disks
    }

    // Check whether a (click)Point is close to this Dot
    boolean closeTo(Point point){
        double distance=distance(point.x,point.y);
        return (distance<10); // Maximum distance from disk center
    }

    // Connecting and disconnecting a dot to other dots
    void connect(int actionNumber){
        if(actionNumber==0)next=null;       // disconnecting this dot
        else if(actionNumber==1)next=dot1;  // connecting this dot to dot1
        else if(actionNumber==2)next=dot2;  // connecting this dot to dot2
    }

    // Drawing a disk at the dot
    void paint(Graphics canvas, Color color){
        canvas.setColor(color);
        canvas.fillPolygon(poly);
        canvas.setColor(Color.black);
        canvas.drawPolygon(poly);
    }
}

//------------------------------------------------------------
// If a disk comes to an EndDot, it gets removed
class EndDot extends Dot {
    Color color;

    EndDot(double x, double y,Color color){
        super(x,y);
        this.color=color;
    }

    // EndDots are not painted
    void paint(Graphics canvas){}

}

//------------------------------------------------------------
// If a disk comes to an ActionDot, the action gets performed
class ActionDot extends Dot {
    Object actionObject=null;
    int actionNumber=0;

    ActionDot(double x, double y){
        super(x,y);
    }

    // Method to set the required action with the ActionDot
    void setAction(Object actionObject,int actionNumber){
        this.actionObject=actionObject;
        this.actionNumber=actionNumber;
    }

    // Method to order the required action
    void action(){
        if(actionObject instanceof Dot){
            Dot connectingDot=(Dot)actionObject;
            connectingDot.connect(actionNumber);
        }
        else if(actionObject instanceof Switch){
            Switch movingSwitch=(Switch)actionObject;
            movingSwitch.action(actionNumber);
        }
        else if(actionObject instanceof Junction){
            Junction junction=(Junction)actionObject;
            junction.action(actionNumber);
        }

    }

}

//------------------------------------------------------------
// New Disks "get born" on a StartDot
class StartDot extends Dot {
    Color color;
    int startNumber;
    Disk disk=null;             // Disk, if on the StartDot
    static StartDot first=null; // First StartDot of a linked list
    StartDot nextStartDot=null; // Next StartDot of a linked list
    static boolean started=false;

    StartDot(ActionDot below, Color color, int startNumber){
        super(below.x,below.y);
        this.color=color;
        this.startNumber=startNumber;
        dot1=below;
        below.setAction(this,0);
        update();
        nextStartDot=StartDot.first;
        StartDot.first=this;
        started=false;
    }

    // Get the Disk started unconditionally
    void start(){
            if(disk!=null){
                disk.move(dot1);
                disk=null;
            }
            Sound.playMusic();
            started=true;

/*
            if(started==false){
                started=true;
                Sound.playMusic();
            }
*/
    }

    // Get the Disk started if the mouse click was close to a StartPoint
    static void clickedAt(Point point){
        for(StartDot s=StartDot.first;s!=null;s=s.nextStartDot){
            if(s.closeTo(point)){
                s.start();
            }
        }
    }

    // Get the Disk started if the correct number was pressed
    static void pressedAt(int number){
        for(StartDot s=StartDot.first;s!=null;s=s.nextStartDot){
            if((s.startNumber==1)&&((number==1)||(number==4)||(number==7))){
                s.start();
            }
            if((s.startNumber==2)&&((number==2)||(number==5)||(number==8))){
                s.start();
            }
            if((s.startNumber==2)&&((number==3)||(number==6)||(number==9))){
                s.start();
            }
        }
    }

    // Get the Disk started if the correct arrow key was pressed
    static void keyAt(int number){
        for(StartDot s=StartDot.first;s!=null;s=s.nextStartDot){
            if((s.color==Color.red)&&(number==37)){
                s.start();
            }
            if((s.color==Color.blue)&&(number==39)){
                s.start();
            }
        }
    }



    // Updating all StartDot
    static void updateAll(){
        for(StartDot s=StartDot.first;s!=null;s=s.nextStartDot){
            s.update();
        }
    }

    // Creating a new disk, when allowed
    void update(){
        boolean farEnough=true;
        for(Disk disk=Disk.first;disk!=null;disk=disk.next){
            farEnough=((farEnough)&&(farEnoughFrom(disk)));
        }
        if(farEnough){disk=new Disk(this);}
    }

}

//------------------------------------------------------------
class JukeboxParts {               // Class to draw the Jukebox outline
    static Polygon leftSide,rightSide,leftInner,rightInner,topMiddle, bottomMiddle,leftBucket,rightBucket, arrow;   // All the Jukebox parts
    static int score=0;                       // Score achieved
    static int errors=0;                      // Errors made
    static Polygon[] scorePart, errorsPart;   // Colorful pie diagram
    static Polygon scoreCircle, errorsCircle; // Circle around the pie

    JukeboxParts(){
        Points points;
        points=new Points(235,147, 176.008,194.916, 184.550,203.840, -3);
        points.addArch(235,147, 231.412,176.785, 238.588,176.785, -5);
        points.addArch(235,147, 285.450,203.840, 285.450,203.840, -3);
        points.addPoints(305,201.271);
        points.addArch(317,289, 305,213.953, 246.008,316.131,-20);
        points.addPoints(235,322.486);
        points.addArch(153,289, 223.992,316.131, 165.000,213.953,-20);
        points.addPoints(165,201.271);
        points.close();
        topMiddle=points.polygon();

        points=new Points(59,329.415);
        points.addPoints(59,603);
        points.addPoints(30,603);
        points.addArch(153,289, 30.000,289.000, 114.598,172.148,20);
        points.addArch(235,147, 114.598,172.148, 212.000,26.170,20);
        points.addPoints(212.000,32.953);
        points.addPoints(223.000,39.271);
        points.addArch(235,147, 223.000,71.953, 164.008,174.131,-20);
        points.addPoints(141.000,187.415);
        points.addArch(153,289, 141.000,213.953, 82.008,316.131,-20);
        points.close();
        leftSide=points.polygon();

        points=new Points(440,603);
        points.addPoints(411,603);
        points.addPoints(411,329.415);
        points.addArch(317,289, 387.992,316.131, 329.000,213.953, -20);
        points.addPoints(329.000,187.415);
        points.addArch(235,147, 305.992,174.131, 247.000,71.953, -20);
        points.addPoints(247.000,39.271);
        points.addPoints(258.008,32.916);
        points.addArch(235,147, 258.000,26.170, 355.402,172.148, 20);
        points.addArch(317,289, 355.402,172.148, 440.000,289.000, 20);
        points.close();
        rightSide=points.polygon();

        points=new Points(194.000,603.000);
        points.addPoints(165.000,603.000);
        points.addPoints(165.000,485.271);
        points.addArch(235,431, 176.008,478.916, 184.550,487.840, -20);
        points.addArch(235,431, 231.412,460.785, 238.588,460.785, -5);
        points.addArch(235,431, 285.450,487.840, 293.992,478.916, -20);
        points.addPoints(305.000,485.271);
        points.addPoints(305.000,603.000);
        points.addPoints(276.000,603.000);
        points.addArch(235,431, 276.000,523.304, 194.000,523.304, 20);
        points.close();
        bottomMiddle =points.polygon();

        points=new Points(141.000,471.415);
        points.addPoints(141.000,603.000);
        points.addPoints(83.000,603.000);
        points.addPoints(83.000,343.271);
        points.addArch(153,289, 94.008,336.916, 102.550,345.840, -20);
        points.addArch(153,289, 149.412,318.785, 156.588,318.785, -20);
        points.addArch(153,289, 203.450,345.840, 211.992,336.916, -20);
        points.addPoints(223.000,343.271);
        points.addArch(235,431, 223.000,355.953, 164.008,458.131,-20);
        points.close();
        leftInner =points.polygon();

        points=new Points(387.000,343.271);
        points.addPoints(387.000, 603);
        points.addPoints(329.000,603);
        points.addPoints(329.000,471.415);
        points.addArch(235,431, 305.992,458.131, 247.000,355.953, -20);
        points.addPoints(247.000,343.271);
        points.addArch(317,289, 258.008,336.916, 266.550,345.840,-20);
        points.addArch(317,289, 313.412, 318.785, 320.588,318.785,-5);
        points.addArch(317,289, 367.450,345.840, 375.992,336.916,-20);
        points.close();
        rightInner =points.polygon();

        points=new Points(4,555);
        points.addPoints(28,555);
        points.addPoints(28,579);
        points.addPoints(196,579);
        points.addPoints(196,555);
        points.addPoints(220,555);
        points.addPoints(220,627);
        points.addPoints(4,627);
        points.close();
        leftBucket=points.polygon();

        points=new Points(250,555);
        points.addPoints(274,555);
        points.addPoints(274,579);
        points.addPoints(442,579);
        points.addPoints(442,555);
        points.addPoints(466,555);
        points.addPoints(466,627);
        points.addPoints(250,627);
        points.close();
        rightBucket=points.polygon();

        points=new Points(240.928,32.023);
        points.addPoints(267.307,57.065);
        points.addPoints(253.704,61.092);
        points.addPoints(310.901,254.304);
        points.addPoints(303.230,256.575);
        points.addPoints(246.033,63.363);
        points.addPoints(232.430,67.390);
        points.close();
        arrow=points.polygon();

        scorePart=new Polygon[41];
        errorsPart=new Polygon[41];
        for(int i=0;i<41;i++){
            double cos=Math.cos(i*9*Math.PI/180);
            double sin=Math.sin(i*9*Math.PI/180);
            int rr=50;
            points=new Points(65,65);
            if(i==0)points.addPoints(65,15);
            else points.addArch(65,65,65,15,65-rr*sin,65-rr*cos,-2*i);
            points.close();
            errorsPart[i]=points.polygon();
            points=new Points(405,65);
            if(i==0)points.addPoints(405,15);
            else points.addArch(405,65,405,15,405+rr*sin,65-rr*cos,2*i);
            points.close();
            scorePart[i]=points.polygon();
        }

        points=new Points(65,65,65,15,65,115,40);
        points.addArch(65,65,65,115,65,15,40);
        errorsCircle=points.polygon();
        points=new Points(405,65,405,15,405,115,40);
        points.addArch(405,65,405,115,405,15,40);
        scoreCircle=points.polygon();

    }

    static void paintAll(Graphics canvas){
        canvas.setColor(Color.green);
        canvas.fillPolygon(topMiddle);
        canvas.fillPolygon(leftSide);
        canvas.fillPolygon(rightSide);
        canvas.fillPolygon(bottomMiddle);
        canvas.fillPolygon(leftInner);
        canvas.fillPolygon(rightInner);
        canvas.setColor(Color.black);
        canvas.drawPolygon(topMiddle);
        canvas.drawPolygon(leftSide);
        canvas.drawPolygon(rightSide);
        canvas.drawPolygon(bottomMiddle);
        canvas.drawPolygon(leftInner);
        canvas.drawPolygon(rightInner);
        canvas.setColor(Color.red);
        canvas.fillPolygon(leftBucket);
        canvas.setColor(Color.black);
        canvas.drawPolygon(leftBucket);
        canvas.setColor(Color.blue);
        canvas.fillPolygon(rightBucket);
        canvas.setColor(Color.black);
        canvas.drawPolygon(rightBucket);

        canvas.setColor(Color.black);
        canvas.setFont(new Font("Arial",Font.PLAIN,24));
        canvas.drawString("Errors="+JukeboxParts.errors, 5,138);
        canvas.drawString("Score="+JukeboxParts.score, 365,138);
        canvas.setColor(Color.white);
        canvas.fillPolygon(scoreCircle);
        canvas.setColor(Color.red);
        if (JukeboxParts.errors<40)
            canvas.fillPolygon(errorsPart[JukeboxParts.errors]);
        else
            canvas.fillPolygon(errorsCircle);
        canvas.setColor(Color.blue);
        if (JukeboxParts.score<40)
            canvas.fillPolygon(scorePart[JukeboxParts.score]);
        else
            canvas.fillPolygon(scoreCircle);
        canvas.setColor(Color.black);
        if (JukeboxParts.errors<40)
            canvas.drawPolygon(errorsPart[JukeboxParts.errors]);
        if (JukeboxParts.score<40)
            canvas.drawPolygon(scorePart[JukeboxParts.score]);
        canvas.drawPolygon(errorsCircle);
        canvas.drawPolygon(scoreCircle);

        if(Disk.stable()&&Switch.stable()){
            canvas.setFont(new Font("Arial",Font.BOLD,48));
            if(JukeboxParts.errors>=40){
                canvas.drawString("YOU LOSE!!!", 90, 305);
                Sound.stop();
            }
            else if(JukeboxParts.score>=40){
                    canvas.drawString("YOU WIN!!!", 100, 305);
                    if(Sound.songNumber!=0){
                        Sound.songNumber=0;
                        Sound.stop();
                        Sound.playMusic();
                    }
            }
            else if(Sound.songNumber==0){
                Sound.stop();
                Sound.songNumber=1;
            }
        }
        if(StartDot.started==false){
            canvas.drawString("INSERT COIN", 80,305);
            canvas.fillPolygon(arrow);
        }

/*
        if(Sound.URLerror){
            canvas.drawString("URL error", 10,10);
        }
        else {
            canvas.drawString("URL OK", 10,10);
        }
*/

    }

}

//------------------------------------------------------------
class Junction {
    // Bringing two disk streams together
    Dot leftIn;            // Left entrance dot
    ActionDot left;        // Dot behind that
    Dot rightIn;           // Right entrance dot
    ActionDot right;       // Dot behind that
    ActionDot middleOut;   // Exit

    Junction(Dot leftIn,ActionDot left,Dot rightIn,ActionDot right,ActionDot middleOut){
    this.leftIn=leftIn;
    this.left=left;
    this.rightIn=rightIn;
    this.right=right;
    this.middleOut=middleOut;
    leftIn.next=left;
    leftIn.dot1=left;
    rightIn.next=right;
    rightIn.dot1=right;
    left.link(middleOut);
    right.link(middleOut);
    left.setAction(this,0);
    right.setAction(this,0);
    middleOut.setAction(this,1);
    }

    void action(int actionNumber){
        leftIn.connect(actionNumber);
        rightIn.connect(actionNumber);
    }

}

//------------------------------------------------------------
class Switch {
    double x,y;               // Coordinates of center of switch
    int l,r;                  // Size of switch notch (1, 2 or 3)
    static Switch first=null; // First switch of linked list of Switch
    Switch next=null;         // Next switch of linked list of Switch
    int fillLeft=0;           // Amount of disks at left side
    int fillRight=0;          // Amount of disks at right side
    static final boolean right=true;
    static final boolean left=false;
    boolean stable=false;      // Whether this switch is not moving

//    boolean direction; // Boolean indication the direction of movement
    Color switchColor=Color.yellow;
    Polygon[] poly; // Drawings of the switch
    int state;         // Number in the range 0-24, indicating the state
                       // 0=turned right, 24=turned left
    Dot[][] arrayLeft;  // Array of dots for switch rotation
    Dot[][] arrayRight; // Array of dots for switch rotation

    Dot entrance;            // Dot at which the switch is entered
    Dot entranceLeft;        // Dot below the entrance for going left
    Dot entranceRight;       // Dot below the entrance for going right
    ActionDot topLeft1;      // Top of the three dots at the entrance
    Dot topLeft2;            // Top of the three dots at the entrance
    Dot topLeft3;            // Top of the three dots at the entrance
    ActionDot topRight1;     // Top of the three dots at the entrance
    Dot topRight2;           // Top of the three dots at the entrance
    Dot topRight3;           // Top of the three dots at the entrance
    Dot bottomLeft1,bottomLeft2,bottomLeft3;     // Dito at the exit
    Dot bottomRight1,bottomRight2,bottomRight3;  // Dito at the exit
    ActionDot exitLeft,exitRight;                // Left & right exits

    Disk[] diskLeft,diskRight; // Disks that are locked inside a switch


    Switch(int l, int r, double x, double y, boolean direction){
        this.x=x;
        this.y=y;
        this.r=r;
        this.l=l;
        if(direction==right) state=0;
        else state=24;

        // Making the Dot structures

        entrance=new Dot(x,y-86);
        entranceLeft=new Dot(x,y-84);
        entranceRight=new Dot(x,y-84);
        entrance.dot1=entranceLeft;
        entrance.dot2=entranceRight;
        topLeft1=new ActionDot(x,y-64);
        topRight1=new ActionDot(x,y-64);
        topLeft2=new Dot(x,y-42);
        topRight2=new Dot(x,y-42);
        topLeft3=new Dot(x,y-20);
        topRight3=new Dot(x,y-20);
        exitLeft=new ActionDot(x-74,y+43);
        bottomLeft1=new Dot(x-55,y+32);
        bottomLeft2=new Dot(x-36,y+21);
        bottomLeft3=new Dot(x-17,y+10);
        exitRight=new ActionDot(x+74,y+43);
        bottomRight1=new Dot(x+55,y+32);
        bottomRight2=new Dot(x+36,y+21);
        bottomRight3=new Dot(x+17,y+10);

        //Setting the actions
        topLeft1.setAction(this,1);      // Adding one disk left
        topRight1.setAction(this,2);     // Adding one disk right
        exitLeft.setAction(this,3);      // Removing one disk left
        exitRight.setAction(this,4);     // Removing one disk right

        //Linking the dots
        if(direction==left){entrance.next=entranceRight;}
        else{entrance.next=entranceLeft;}
        entranceLeft.link(topLeft1);
        if(l>1){topLeft1.link(topLeft2);}
        if(l>2){topLeft2.link(topLeft3);}
        entranceRight.link(topRight1);
        if(r>1){topRight1.link(topRight2);}
        if(r>2){topRight2.link(topRight3);}
        bottomLeft3.link(bottomLeft2);
        bottomLeft2.link(bottomLeft1);
        bottomLeft1.link(exitLeft);
        bottomRight3.link(bottomRight2);
        bottomRight2.link(bottomRight1);
        bottomRight1.link(exitRight);

        // Making the rotating Dots structure
        arrayLeft=new Dot[4][25];    // Array of dots for switch rotation
        arrayRight=new Dot[4][25];   // Array of dots for switch rotation
        for(int i=1;i<=3;i++){        // Disk entries 1..3
            for(int j=1;j<25;j++){    // Switch orientations 0..24
                double cos=Math.cos(j*5*Math.PI/180);           // 5 deg steps
                double sin=Math.sin(j*5*Math.PI/180);           // 5 deg steps
                int rr=86-22*i;                                 // radius
                arrayLeft[i][j]=new Dot((int)x-rr*sin,(int)y-rr*cos);
                arrayRight[i][j]=new Dot((int)x+rr*sin,(int)y-rr*cos);
            }

        // Matching the outgoing dots
        arrayLeft[1][24]=bottomLeft1;
        arrayLeft[2][24]=bottomLeft2;
        arrayLeft[3][24]=bottomLeft3;
        arrayRight[1][24]=bottomRight1;
        arrayRight[2][24]=bottomRight2;
        arrayRight[3][24]=bottomRight3;
        }

        // Initialising the (null) Disks inside the switch
        diskLeft=new Disk[4];
        diskRight=new Disk[4];
        for(int i=1;i<=3;i++){
            diskLeft[i]=null;
            diskRight[i]=null;
        }

        // Calculating the switch in its basic orientation
        Points switchPoints;
        if(l==3)
            switchPoints=new Points(0,20,-12,20,12,20,10);
        else if(l==2)
            switchPoints=new Points(0,42,-12,42,12,42,10);
        else switchPoints=new Points(0,64,-12,64,12,64,10);
        switchPoints.addArch(0,0,12,73.02,69.34,-26.12,-20);
        if(r==3)
            switchPoints.addArch(17.31,-10,23.32,0.39,11.32,-20.39,10);
        else if (r==2)
            switchPoints.addArch(36.37,-21,42.37,-10.61,30.37,-31.39,10);
        else
            switchPoints.addArch(55.43,-32,61.43,-21.61,49.43,-42.34,10);
        switchPoints.addArch(0,0,57.24,-46.90,50.19,-54.38,-5);
//        switchPoints.addArch(0,0,29.80,-42.61,-22,47.12,-30);
        switchPoints.addArch(0,0,4,-27.713,-22,17.321,-30);
        switchPoints.addArch(0,0,-22,70.65,-12,73.02,-5);
        switchPoints.close();
        switchPoints.flip();

        // Calculating the switch in its various orientation
        int[] angle=new int[25];  // The 25 orientations of the switch
        poly=new Polygon[angle.length];
        for(int i=0;i<angle.length;i++){
            angle[i]=5*i;
            poly[i]=switchPoints.rotate(angle[i]).offset(x,y).polygon();
        }

        // Adding this switch to the linked list of Switch
        next=Switch.first;
        Switch.first=this;
    }


    // Action to change the state of the switch
    void action(int actionNumber){

        if(actionNumber==1){       // Adding one disk left
            fillLeft=fillLeft+1;
            if(fillLeft==l){
                entrance.connect(0);
                for(Disk disk=Disk.first;disk!=null;disk=disk.next){
                    if(disk.dot==topLeft1) {diskLeft[1]=disk;}
                    else if(disk.dot==topLeft2){diskLeft[2]=disk;}
                    else if(disk.dot==topLeft3){diskLeft[3]=disk;}
                }
            }
        }
        else if(actionNumber==2){       // Adding one disk right
            fillRight=fillRight+1;
            if(fillRight==r){
                entrance.connect(0);
                for(Disk disk=Disk.first;disk!=null;disk=disk.next){
                    if(disk.dot==topRight1){diskRight[1]=disk;}
                    else if(disk.dot==topRight2){diskRight[2]=disk;}
                    else if(disk.dot==topRight3){diskRight[3]=disk;}
                }
            }
        }
        else if(actionNumber==3){       // Removing one disk left
            fillLeft=fillLeft-1;
        }
        else if(actionNumber==4){       // Removing one disk right
            fillRight=fillRight-1;
        }
    }

    // Method to update all the switches on the canvas
    static void updateAll(){
        for(Switch switchh=Switch.first;switchh!=null;switchh=switchh.next){
            switchh.update();
        }
    }

    // Method to update this switch
    void update(){
        stable=true;
        if((fillLeft==l)&&(fillRight==0)){
            if(state<24){
                state = state +1;
                stable=false;
                for(int i=1;i<=l;i++){
                    diskLeft[i].dot=arrayLeft[i][state];
                }
                if(state==24){entrance.connect(2);}
            }
        }
        else if((fillRight==r)&&(fillLeft==0)){
            if(state>0){
                state = state -1;
                stable=false;
                for(int i=1;i<=r;i++){
                    diskRight[i].dot=arrayRight[i][24-state];
                }
                if(state==0){entrance.connect(1);}
            }
        }
    }

    // Method to check whether all switches are stable
    static boolean stable(){
        boolean stable=true;
        for(Switch switchh=Switch.first;switchh!=null;switchh=switchh.next){
            if(switchh.stable==false) stable=false;
        }
        return stable;
    }


    // Method to paint all the switches on the canvas
    static void paintAll(Graphics canvas){
        for(Switch switchh=Switch.first;switchh!=null;switchh=switchh.next){
            switchh.paint(canvas);
        }
    }

    // Method to paint the switch configuration on a canvas
    void paint(Graphics canvas){
        canvas.setColor(switchColor);
        canvas.fillPolygon(poly[state]);
        canvas.setColor(Color.black);
        canvas.drawPolygon(poly[state]);
//        canvas.drawString(fillLeft+"  "+fillRight,(int)x-30,(int)y);
    }
}



//------------------------------------------------------------
class Points {                  // Class to easily draw polygons
    double[] x;        // Array of x-coordinates
    double[] y;        // Array of y-coordinates
    int length;       // Length of the arrays

    Points(){                                       // Empty 
        x=new double[0];
        y=new double[0];
        length=0;
    }

    Points(double x, double y){                       // x,y pair
        this.x=new double[1];
        this.y=new double[1];
        this.x[0]=x;
        this.y[0]=y;
        length=1;
    }

    Points(double[] x, double[] y){                   // Array of x,y
        this.x=x;
        this.y=y;
        length=x.length;
    }

    Points (double cenx, double ceny, double startx, double starty, double endx, double endy, int steps){                             // Building an arch
            // cenx,ceny are the coordinates of the center
            // startx,starty are the coordinates of the starting point
            // endx,endy are the coordinates of the end point
            // steps are the number of steps in between
            // steps>0: clockwise arch
            // steps<0: anticlockwise arch
        length=(int)Math.abs(steps)+1;
        x=new double[length];
        y=new double[length];
        double span=Math.sqrt((startx-cenx)*(startx-cenx)+(starty-ceny)*(starty-ceny));
        double alphastart= Math.atan2(starty-ceny,startx-cenx);
        double alphaend=Math.atan2(endy-ceny,endx-cenx);
        double delta=Math.abs(alphaend-alphastart)/steps;
        if((alphaend-alphastart)*steps<0){
            delta=(2*Math.PI-Math.abs(alphaend-alphastart))/steps;
        }
        double alpha;
        for(int i=0;i<length;i++){
            alpha=alphastart+i*delta;
            x[i]=cenx+span*Math.cos(alpha);
            y[i]=ceny+span*Math.sin(alpha);
        }
    }

    void addPoints(double x, double y){   // Add single x,y
        double[] outx=new double[length+1];
        double[] outy=new double[length+1];
        for(int i=0;i<length;i++){
            outx[i]=this.x[i];
            outy[i]=this.y[i];
        }
        outx[length]=x;
        outy[length]=y;
        this.x=outx;
        this.y=outy;
        this.length=this.x.length;
    }

    void addPoints(double[] x, double[] y){   // Add array of x,y
        double[] outx=new double[length+x.length];
        double[] outy=new double[length+y.length];
        for(int i=0;i<length;i++){
            outx[i]=this.x[i];
            outy[i]=this.y[i];
        }
        for(int i=0;i<x.length;i++){
            outx[i+length]=x[i];
            outy[i+length]=y[i];
        }
        this.x=outx;
        this.y=outy;
        this.length=this.x.length;
    }

    void addPoints(Points in){           // Add array of Points
        addPoints(in.x, in.y);
    }

    void close(){              // Make last point identical to first
        addPoints(x[0],y[0]);
    }

    void addArch(double cenx, double ceny, double startx, double starty, double endx, double endy, int steps){             // Adding an arch
        addPoints(new Points(cenx, ceny, startx, starty, endx, endy, steps));
    }

    void flip(){                           // Flipping in y-direction
        for(int i=0;i<length;i++){
            y[i]=-y[i];
        }
    }

    Points offset(double x, double y){         // Offsetting Points
        double[] outx=new double[length];
        double[] outy=new double[length];
        for(int i=0;i<length;i++){
            outx[i]=this.x[i]+x;
            outy[i]=this.y[i]+y;
        }
        return new Points(outx,outy);
    }

    Points rotate(int alpha){                 // Rotating Points around 0,0
        // alpha is the rotation angle in degrees
        double cos=Math.cos(alpha*Math.PI/180);
        double sin=Math.sin(alpha*Math.PI/180);
        double[] outx=new double[length];
        double[] outy=new double[length];
        for(int i=0;i<length;i++){
            outx[i]= x[i]*cos+y[i]*sin;
            outy[i]=-x[i]*sin+y[i]*cos;
        }
        return new Points(outx,outy);
    }

    Polygon polygon(){                 // Converting Points object into Polygon
        int[] xx=new int[length];
        int[] yy=new int[length];
        for(int i=0;i<length;i++){
            xx[i]=(int)Math.round(x[i]);
            yy[i]=(int)Math.round(y[i]);
        }
        return new Polygon(xx,yy,length);
    }

}


//------------------------------------------------------------
class Disk {
    Dot dot;                    // Dot at which the disk is locatel
    Color color;                // Color of the disk
    static Disk first=null;     // First disk of a linked list of Disk
    Disk next=null;             // Next disk of a linked list of Disk
    Disk previous=null;         // Previous disk of a linked list of Disk

    Disk(Dot dot){
        this.dot=dot;
        StartDot startDot=(StartDot)dot;
        color=startDot.color;
        add();
    }

    // Method to add this disk to the linked list of Disk
    void add(){
        next=Disk.first;
        if(next!=null) next.previous=this;
        Disk.first=this;
    }

    // Method to remove this disk from the linked list of Disk
    void remove(){
        if(next!=null) next.previous=previous;
        if(previous!=null) previous.next=next;
        if(Disk.first==this) Disk.first=Disk.first.next;
    }

    // Method to move a disk onto another dot
    void move(Dot dot){
        this.dot=dot;
    }

    // Method to check whether a disk can move
    boolean canMove(){
        boolean canMove=(dot.next!=null);
        if(canMove){
            for(Disk disk=Disk.first;disk!=null;disk=disk.next){
                if(disk!=this){
                    canMove=((canMove)&&(dot.next.farEnoughFrom(disk)));
                }
            }
        }
        return canMove;
    }

    // Method to check and move this disk one step forward
    void update(){
        if(dot instanceof EndDot) {
            EndDot endDot=(EndDot) dot;
            if(color==endDot.color){
                JukeboxParts.score= JukeboxParts.score+1;
                Sound.playFeedback(1);
            }
            else {
               JukeboxParts.errors= JukeboxParts.errors+1;
               JukeboxParts.score= JukeboxParts.score-1;
               if(JukeboxParts.score<0) JukeboxParts.score=0;
                Sound.playFeedback(0);
            }
        remove();}
        else {
            if(canMove()){
                dot=dot.next;
                if(dot instanceof ActionDot){
                    ActionDot actionDot=(ActionDot)dot;
                    actionDot.action();
                }
            }
        }
    }

    // Method to update all disks
    static void updateAll() {
        for(Disk disk=Disk.first;disk!=null;disk=disk.next){
            disk.update();
        }
    }

    // Method to see if all Disk are stable
    static boolean stable(){
        boolean stable=true;
        for(Disk disk=Disk.first;disk!=null;disk=disk.next){
            if(disk.canMove())stable=false;
        }
        return stable;
    }

    // Method to paint this disk
    void paint(Graphics canvas){
        dot.paint(canvas,color);
    }

    // Method to paint all disks
    static void paintAll(Graphics canvas){
        for(Disk disk=Disk.first;disk!=null;disk=disk.next){
            disk.paint(canvas);
        }
    }

}

//---------------------------------------
class Challenge{
    static void setChallenge(int challengeNumber){

        // Removing any old challenge
        Switch.first=null;
        Disk.first=null;
        StartDot.first=null;
        JukeboxParts jukeboxParts=new JukeboxParts();

        // Resetting the scores
        JukeboxParts.score=0;
        JukeboxParts.errors=0;

        // Stopping the music and setting the song number
        Sound.stop();
        Sound.setSongNumber(challengeNumber);

        // Setting the new challenge
        double[] xs={235,153,317,235};
        double[] ys={147,289,289,431};
        Switch[] switches=null;
        if(challengeNumber==1){
            int[] l={1,1,1,1};
            int[] r={1,1,1,1};
            switches=Challenge.switches(l,r,xs,ys);
        }
        else if(challengeNumber==2){
            int[] l={1,2,1,1};
            int[] r={1,1,1,1};
            switches=Challenge.switches(l,r,xs,ys);
        }
        else if(challengeNumber==3){
            int[] l={1,2,1,1};
            int[] r={1,1,1,2};
            switches=Challenge.switches(l,r,xs,ys);
        }
        else if(challengeNumber==4){
            int[] l={1,2,1,1};
            int[] r={2,1,2,1};
            switches=Challenge.switches(l,r,xs,ys);
        }
        else if(challengeNumber==5){
            int[] l={1,2,1,2};
            int[] r={3,1,3,2};
            switches=Challenge.switches(l,r,xs,ys);
        }
        else if(challengeNumber==6){
            int[] l={1,1,1,1};
            int[] r={1,2,1,1};
            switches=Challenge.switches(l,r,xs,ys);
        }
        else if(challengeNumber==7){
            int[] l={1,1,1,3};
            int[] r={1,2,3,1};
            switches=Challenge.switches(l,r,xs,ys);
        }
        else if(challengeNumber==8){
            int[] l={1,1,1,3};
            int[] r={3,2,1,2};
            switches=Challenge.switches(l,r,xs,ys);
        }
        else if(challengeNumber==9){
            int[] l={1,1,2,2};
            int[] r={1,3,1,2};
            switches=Challenge.switches(l,r,xs,ys);
        }
        else if(challengeNumber==10){
            int[] l={2,1,1,1};
            int[] r={1,2,1,2};
            switches=Challenge.switches(l,r,xs,ys);
        }
        else if(challengeNumber==11){
            int[] l={2,1,3,2};
            int[] r={1,2,1,3};
            switches=Challenge.switches(l,r,xs,ys);
        }
        else if(challengeNumber==12){
            int[] l={2,2,2,2};
            int[] r={3,3,2,2};
            switches=Challenge.switches(l,r,xs,ys);
        }


        // Setting the dot structures
        ActionDot left1=new ActionDot(224,14);
        ActionDot right1=new ActionDot(246,14);
        StartDot startLeft=new StartDot(left1,Color.red,1);
        StartDot startRight=new StartDot(right1,Color.blue,2);
        ActionDot left2=new ActionDot(224,12);
        ActionDot right2=new ActionDot(246,12);
        ActionDot middleTop=new ActionDot(235,31);
        Junction juction1=new Junction(left1,left2,right1,right2,middleTop);
        Dot left3=new Dot(224,26);
        Dot right3=new Dot(246,26);
        left2.link(left3);
        right2.link(right3);
        left3.link(middleTop);
        right3.link(middleTop);

        // Linking the switches
        Dot entrance2=new Dot(153,194.343);
        Dot entrance3=new Dot(317,194.343);
        ActionDot entrance4=new ActionDot(235,336.343);
        Dot entrance5=new Dot(71,336.343);
        Dot entrance6=new Dot(153,478.343);
        Dot entrance7=new Dot(317,478.343);
        Dot entrance8=new Dot(399,336.343);
        middleTop.link(switches[1].entrance);
        switches[1].exitLeft.link(entrance2);
        switches[1].exitRight.link(entrance3);
        entrance2.link(switches[2].entrance);
        entrance3.link(switches[3].entrance);

        Dot la=new Dot(215.947,325.343);
        ActionDot lb=new ActionDot(217.766,326.393);
        Dot ra=new Dot(254.053,325.343);
        ActionDot rb=new ActionDot(252.234,326.393);
        Junction junction2=new Junction(la,lb,ra,rb,entrance4);
        switches[2].bottomRight1.link(la);
        lb.link(switches[2].exitRight);
        switches[2].exitRight.link(entrance4);
        switches[3].bottomLeft1.link(ra);
        rb.link(switches[3].exitLeft);
        switches[3].exitLeft.link(entrance4);
        entrance4.link(switches[4].entrance);

        EndDot endLeft1=new EndDot(71,593,Color.red);
        EndDot endLeft2=new EndDot(153,593,Color.red);
        EndDot endRight1=new EndDot(317,593,Color.blue);
        EndDot endRight2=new EndDot(399,593,Color.blue);

        switches[2].exitLeft.link(entrance5);
        switches[4].exitLeft.link(entrance6);
        switches[4].exitRight.link(entrance7);
        switches[3].exitRight.link(entrance8);

        entrance5.link(endLeft1);
        entrance6.link(endLeft2);
        entrance7.link(endRight1);
        entrance8.link(endRight2);

    }

    // Building the Switches
    static Switch[] switches(int[] l, int[] r, double[] x,double[] y){
        Switch[] switches=new Switch[x.length+1];
        for(int i=0;i<x.length;i++){
            switches[i+1]=new Switch(l[i],r[i],x[i],y[i],(Math.random()>0.5));
        }
        return switches;
    }

}


//---------------------------------------
class Sound {
    static Jukebox jukebox;
    static Sound sound;
    static Player musicPlayer=null;
    static Player feedbackPlayer=null;
    static AudioClip[] music;
    static AudioClip[] feedback;
    static String[] musicNames={"0: Champions", "1: Rock ar. the Clock", "2: BluesBrothers", "3: Phantom Opera","4: Good bad & ugly", "5:Tubular Bells", "6: We'll Rock You", "7: The Wall", "8: Popcorn", "9: The Piano", "10: Mission Impossible", "11: Live & let die", "12: Mammagamma"};
    static String[] musicLocations={"Champions.wav", "RockATClock.mid", "BluesBrothers.mid", "Phantom.mid", "Good_Bad_Ugly.mid", "Tubularbells.mid", "Rockyou.mid", "Brickwall.mid", "Popcorn.mid", "ThePiano.mid", "Mission.mid", "LiveAndLetDie.mid", " Mammagamma.mid "};
    static String[] feedbackLocations={"Buzzer.wav", "CashRegister.wav"};
    static boolean play=false;
    static boolean loop=true;
    static int songNumber;
    static boolean URLerror=false;

    Sound(Jukebox jukebox){
        this.jukebox=jukebox;
        this.sound=this;
        music=new AudioClip[musicLocations.length];
/*
        URL codebase=jukebox.getDocumentBase();
        String f1= new String (codebase.getPath() + "/Jukebox.jar");
        URL jar=null;
        try{
            jar=new URL (codebase.getProtocol(), codebase.getHost(), f1);
        } catch(MalformedURLException e) {URLerror=true;}
*/
        for(int i=0;i<musicLocations.length;i++){
            music[i]=jukebox.getAudioClip(jukebox .getCodeBase(), musicLocations[i]);
//            music[i]=jukebox.getAudioClip(jar, musicLocations[i]);
        };
        feedback=new AudioClip[2];
        for(int i=0;i<feedbackLocations.length;i++){
            feedback[i]=jukebox.getAudioClip(jukebox .getCodeBase(), feedbackLocations[i]);
//            feedback[i]=jukebox.getAudioClip(jar, feedbackLocations[i]);
        };
    }

    static void setSongNumber(int songNumber){
        Sound.songNumber=songNumber;
    }

    static void playMusic(){
/*
        if(musicPlayer!=null){
            musicPlayer.stop();
        }
*/
        if(musicPlayer==null){
            musicPlayer=new Player(music[songNumber],Sound.loop);
        }
    }

    static void playFeedback(int feedbackNumber){
        feedbackPlayer=new Player(feedback[feedbackNumber],Sound.play);
    }

    static void stop(){
        if(musicPlayer!=null){
            musicPlayer.stop();
            musicPlayer=null;
        }
    }
}


//---------------------------------------
class Player implements Runnable {
    AudioClip audioClip;
    Thread runner=null;
    boolean looping;

    Player(AudioClip audioClip, boolean looping){
        this.audioClip=audioClip;
        this.looping=looping;
        runner = new Thread(this);
        runner.start();
    }

    void stop(){
        if (audioClip!= null)
            audioClip.stop();
        runner=null;
    }

    public void run(){
        if (audioClip!= null){
            if(looping==Sound.loop) audioClip.loop();
            else audioClip.play();
        }
    }
}


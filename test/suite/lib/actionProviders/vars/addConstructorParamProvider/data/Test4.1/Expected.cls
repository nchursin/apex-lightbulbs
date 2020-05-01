public class Test {
    public String stringVar;
    public String stringVarWithSpaces; 

    public Test() {

    }           

    public class InnerClass {
        public String innerClassVar;
        public String innerClassVar2;

        public InnerClass(
            String innerClassVar, String innerClassVar2
        ) {
            this.innerClassVar2 = innerClassVar2;
            this.innerClassVar = innerClassVar;
        }
    }
}

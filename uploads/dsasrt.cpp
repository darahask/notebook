#include<bits/stdc++.h>
using namespace std;

void printMatches(string pattern, string maintxt, int primeno)
{
    int patlen = pattern.length();
    int txtlen = maintxt.length();
    int hp = 0; //hash value for pattern
    int ht = 0; //hash value for maintext
    int h = 1;
    int nofchar = 256;

    // The value of h is "pow(d, M-1)%q"  
    for (int i = 0; i < patlen - 1; i++)  
        h = (h * nofchar) % primeno;  
    
    // finding hash values for pattern and maintext's first window
    for(int i = 0; i < patlen; i++){
        hp = (nofchar*hp + (int)pattern[i]) % primeno;
        ht = (nofchar*ht + (int)maintxt[i]) % primeno;
    }

    //Moving the pattern rightwards over text
    for(int i = 0; i<=(txtlen - patlen); i++){
        if(hp == ht){
            if (maintxt.substr(i, patlen) == pattern)
                cout << pattern << endl;
        }
        // Calculating hash for next window i.e, shifting right by one
        if(i < (txtlen - patlen)){
            ht = (nofchar*(ht - (int)maintxt[i]*h) + (int)maintxt[i+patlen]) % primeno;  
            if (ht < 0)  
                ht = (ht + primeno);  
        }
    }
}

void rabinKarpDriver(string pattern, string maintxt, int primeno, int size){
    int patlen = pattern.length();
    for(int i = 0; i <= (patlen - size); i++){
        printMatches(pattern.substr(i,size),maintxt,primeno);
    }
}

int main(int argc, char const *argv[])
{
    string txt;
    string pattern;
    int size;
    cout<<"Enter Maintext: ";
    cin>>txt;
    cout<<"Enter Pattern: ";
    cin>>pattern;
    cout<<"Enter Substring Size: ";
    cin>>size;
    rabinKarpDriver(pattern,txt,101,size);
    return 0;
}
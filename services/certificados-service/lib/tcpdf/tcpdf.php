<?php
// Versão simplificada do TCPDF para este projeto
// Em produção, use: composer require tecnickcom/tcpdf

if (!class_exists('TCPDF')) {
    class TCPDF {
        private $orientation = 'L';
        private $unit = 'mm';
        private $format = 'A4';
        private $pages = [];
        private $currentPage = null;
        private $font = 'helvetica';
        private $fontSize = 12;
        private $textColor = [0, 0, 0];
        private $printHeader = true;
        private $printFooter = true;
        private $title = '';
        private $author = '';
        private $subject = '';
        private $creator = '';

        public function __construct($orientation = 'P', $unit = 'mm', $format = 'A4', $unicode = true, $encoding = 'UTF-8', $diskcache = false, $pdfa = false) {
            $this->orientation = $orientation;
            $this->unit = $unit;
            $this->format = $format;
        }

        public function SetCreator($creator) {
            $this->creator = $creator;
        }

        public function SetAuthor($author) {
            $this->author = $author;
        }

        public function SetTitle($title) {
            $this->title = $title;
        }

        public function SetSubject($subject) {
            $this->subject = $subject;
        }

        public function setPrintHeader($print) {
            $this->printHeader = $print;
        }

        public function setPrintFooter($print) {
            $this->printFooter = $print;
        }

        public function SetFont($family, $style = '', $size = 12) {
            $this->font = $family;
            $this->fontSize = $size;
        }

        public function SetTextColor($r, $g = null, $b = null) {
            if ($g === null) {
                $this->textColor = [$r, $r, $r];
            } else {
                $this->textColor = [$r, $g, $b];
            }
        }

        public function AddPage() {
            $this->currentPage = ['content' => ''];
            $this->pages[] = &$this->currentPage;
        }

        public function Cell($w, $h, $txt, $border = 0, $ln = 0, $align = '', $fill = false, $link = '') {
            $this->currentPage['content'] .= $txt . "\n";
        }

        public function MultiCell($w, $h, $txt, $border = 0, $align = '', $fill = false) {
            $this->currentPage['content'] .= $txt . "\n";
        }

        public function Ln($h = null) {
            $this->currentPage['content'] .= "\n";
        }

        public function Output($name = '', $dest = 'I') {
            // Implementação simplificada - em produção use a biblioteca real
            $content = "%PDF-1.4\n";
            $content .= "1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\n";
            $content .= "xref\n0 1\ntrailer\n<<\n/Size 1\n/Root 1 0 R\n>>\n";
            $content .= "%%EOF";
            
            if ($dest === 'F' && $name) {
                file_put_contents($name, $content);
            } else {
                header('Content-Type: application/pdf');
                echo $content;
            }
        }
    }
}








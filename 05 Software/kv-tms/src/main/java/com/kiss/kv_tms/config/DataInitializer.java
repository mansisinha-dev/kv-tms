package com.kiss.kv_tms.config;

import com.kiss.kv_tms.entity.Course;
import com.kiss.kv_tms.entity.Role;
import com.kiss.kv_tms.entity.Trainer;
import com.kiss.kv_tms.entity.User;
import com.kiss.kv_tms.repository.CourseRepository;
import com.kiss.kv_tms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.kiss.kv_tms.repository.TrainerRepository trainerRepository;

    @Autowired
    private com.kiss.kv_tms.repository.RawMaterialRepository rawMaterialRepository;

    @Autowired
    private com.kiss.kv_tms.repository.ProductRepository productRepository;

    @Autowired
    private com.kiss.kv_tms.repository.BillOfMaterialsRepository bomRepository;

    @Autowired
    private com.kiss.kv_tms.repository.ProductionRunRepository productionRunRepository;

    @Autowired
    private com.kiss.kv_tms.repository.FinishedGoodsStockRepository finishedGoodsStockRepository;

    @Autowired
    private com.kiss.kv_tms.repository.OrderItemRepository orderItemRepository;

    @Autowired
    private com.kiss.kv_tms.repository.WorkshopRepository workshopRepository;

    @Autowired
    private com.kiss.kv_tms.repository.NoticeRepository noticeRepository;

    @Autowired
    private com.kiss.kv_tms.repository.TraineeRepository traineeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedCourses();
        seedAdminUser();
        seedTrainerUser();
        seedProductionManagerUser();
        seedTraineeUser();
        seedProductionData();
        seedWorkshops();
        seedFinishedGoodsInventory();
        seedNotices();
    }

    private void seedCourses() {
        if (courseRepository.count() == 0) {
            List<Course> courses = List.of(
                    Course.builder()
                            .name("Sewing & Apparel Manufacturing")
                            .code("VOC-SEW-101")
                            .description("Practical training in garment making, tailoring, and textile production.")
                            .durationMonths(6)
                            .active(true)
                            .build(),
                    Course.builder()
                            .name("Handicrafts & Tribal Art")
                            .code("VOC-ART-102")
                            .description("Traditional tribal craft, painting, bamboo work, and heritage artifacts.")
                            .durationMonths(6)
                            .active(true)
                            .build(),
                    Course.builder()
                            .name("Food Processing & Preservation")
                            .code("VOC-FOD-103")
                            .description("Training in hygienic packaging, bakery products, and organic food preservation.")
                            .durationMonths(4)
                            .active(true)
                            .build(),
                    Course.builder()
                            .name("Carpentry & Woodwork")
                            .code("VOC-CAR-104")
                            .description("Woodcrafting, furniture assembly, and basic carpentry skills.")
                            .durationMonths(6)
                            .active(true)
                            .build()
            );

            courseRepository.saveAll(courses);
            System.out.println(">>> [KV-TMS] Seeded 4 default vocational courses successfully.");
        }
    }

    private void seedAdminUser() {
        User admin = userRepository.findByCollegeId("KISS-ADM-001").orElseGet(() ->
                User.builder()
                        .collegeId("KISS-ADM-001")
                        .role(Role.ROLE_ADMIN)
                        .build()
        );
        admin.setEmail("admin@kiss.ac.in");
        admin.setFullName("Dr. Debashis Mohanty");
        admin.setContactNumber("9437012345");
        admin.setDepartment("Central Administration");
        admin.setPassword(passwordEncoder.encode("KISS-ADM-001@123"));
        admin.setActive(true);
        userRepository.save(admin);
        System.out.println(">>> [KV-TMS] Seeded/Synchronized Admin account (ID: KISS-ADM-001 | Password: KISS-ADM-001@123).");
    }

    private void seedTrainerUser() {
        User faculty = userRepository.findByCollegeId("KISS-FAC-001").orElseGet(() ->
                User.builder()
                        .collegeId("KISS-FAC-001")
                        .role(Role.ROLE_TRAINER)
                        .build()
        );
        faculty.setEmail("trainer@kiss.ac.in");
        faculty.setFullName("Prof. Sanatan Marndi");
        faculty.setContactNumber("9876543210");
        faculty.setPassword(passwordEncoder.encode("KISS-FAC-001@123"));
        faculty.setActive(true);
        User savedFaculty = userRepository.save(faculty);

        Trainer trainer = trainerRepository.findByUserId(savedFaculty.getId()).orElseGet(() ->
                Trainer.builder().user(savedFaculty).build()
        );
        trainer.setFullName("Prof. Sanatan Marndi");
        trainer.setContactNumber("9876543210");
        trainer.setSpecialization("Handicrafts & Tribal Art (VOC-ART-102)");
        trainerRepository.save(trainer);
        System.out.println(">>> [KV-TMS] Seeded/Synchronized Trainer account (ID: KISS-FAC-001 | Password: KISS-FAC-001@123).");
    }

    private void seedProductionManagerUser() {
        User prodManager = userRepository.findByCollegeId("KISS-PRD-001").orElseGet(() ->
                User.builder()
                        .collegeId("KISS-PRD-001")
                        .role(Role.ROLE_PRODUCTION_MANAGER)
                        .build()
        );
        prodManager.setEmail("production@kiss.ac.in");
        prodManager.setFullName("Kavita Priyadarshini Das");
        prodManager.setContactNumber("0674-2725386");
        prodManager.setDepartment("Production & Manufacturing");
        prodManager.setPassword(passwordEncoder.encode("KISS-PRD-001@123"));
        prodManager.setActive(true);
        userRepository.save(prodManager);
        System.out.println(">>> [KV-TMS] Seeded/Synchronized Production Manager (ID: KISS-PRD-001 | Password: KISS-PRD-001@123).");
    }

    private void seedTraineeUser() {
        Course sewingCourse = courseRepository.findByCode("VOC-SEW-101").orElse(null);
        User studentUser = userRepository.findByCollegeId("KISS-TRN-2026-001").orElseGet(() ->
                User.builder()
                        .collegeId("KISS-TRN-2026-001")
                        .role(Role.ROLE_TRAINEE)
                        .build()
        );
        studentUser.setEmail("laxman.majhi@kiss.ac.in");
        studentUser.setFullName("Laxman Majhi");
        studentUser.setContactNumber("9861234567");
        studentUser.setPassword(passwordEncoder.encode("KISS-TRN-2026-001@123"));
        studentUser.setActive(true);
        User savedStudent = userRepository.save(studentUser);

        com.kiss.kv_tms.entity.Trainee trainee = traineeRepository.findByUserId(savedStudent.getId()).orElseGet(() ->
                com.kiss.kv_tms.entity.Trainee.builder().user(savedStudent).build()
        );
        trainee.setFullName("Laxman Majhi");
        trainee.setContactNumber("9861234567");
        trainee.setAssignedCourse(sewingCourse);
        if (trainee.getAdmissionDate() == null) {
            trainee.setAdmissionDate(java.time.LocalDate.now().minusMonths(2));
            trainee.setJoiningDate(java.time.LocalDate.now().minusMonths(2));
            trainee.setAddress("KISS Campus Hostel #4, Bhubaneswar, Odisha");
            trainee.setDob(java.time.LocalDate.of(2004, 5, 12));
            trainee.setBloodGroup("O+");
            trainee.setCourseFee(0.0);
            trainee.setScholarshipType("100% Free Tribal Welfare Scholarship (KISS)");
            trainee.setScholarshipPercentage(100);
            trainee.setNetFeePayable(0.0);
            trainee.setFeeStatus("SCHOLARSHIP_PAID");
        }
        traineeRepository.save(trainee);
        System.out.println(">>> [KV-TMS] Seeded/Synchronized Trainee account (ID: KISS-TRN-2026-001 | Password: KISS-TRN-2026-001@123).");
    }

    private void seedProductionData() {
        com.kiss.kv_tms.entity.RawMaterial cotton = rawMaterialRepository.findByName("Pure Cotton Fabric").orElse(null);
        if (cotton == null) {
            cotton = rawMaterialRepository.save(
                    com.kiss.kv_tms.entity.RawMaterial.builder()
                            .name("Pure Cotton Fabric")
                            .unitOfMeasure("Meters")
                            .currentStock(350.0)
                            .reorderLevel(50.0)
                            .unitCost(120.0)
                            .build()
            );
        }

        com.kiss.kv_tms.entity.RawMaterial buttons = rawMaterialRepository.findByName("Wooden Handicraft Buttons").orElse(null);
        if (buttons == null) {
            buttons = rawMaterialRepository.save(
                    com.kiss.kv_tms.entity.RawMaterial.builder()
                            .name("Wooden Handicraft Buttons")
                            .unitOfMeasure("Pieces")
                            .currentStock(600.0)
                            .reorderLevel(100.0)
                            .unitCost(5.0)
                            .build()
            );
        }

        com.kiss.kv_tms.entity.RawMaterial silk = rawMaterialRepository.findByName("Handloom Silk Yarn").orElse(null);
        if (silk == null) {
            silk = rawMaterialRepository.save(
                    com.kiss.kv_tms.entity.RawMaterial.builder()
                            .name("Handloom Silk Yarn")
                            .unitOfMeasure("Kg")
                            .currentStock(45.0)
                            .reorderLevel(10.0)
                            .unitCost(850.0)
                            .build()
            );
        }

        com.kiss.kv_tms.entity.RawMaterial herbalDye = rawMaterialRepository.findByName("Organic Herbal Dyes").orElse(null);
        if (herbalDye == null) {
            herbalDye = rawMaterialRepository.save(
                    com.kiss.kv_tms.entity.RawMaterial.builder()
                            .name("Organic Herbal Dyes")
                            .unitOfMeasure("Litres")
                            .currentStock(8.0)
                            .reorderLevel(15.0)
                            .unitCost(320.0)
                            .build()
            );
        }

        if (productRepository.count() == 0) {
            com.kiss.kv_tms.entity.Course sewingCourse = courseRepository.findByCode("VOC-SEW-101").orElse(null);
            com.kiss.kv_tms.entity.Course artCourse = courseRepository.findByCode("VOC-ART-102").orElse(sewingCourse);

            com.kiss.kv_tms.entity.Product kurti = productRepository.save(
                    com.kiss.kv_tms.entity.Product.builder()
                            .name("Handcrafted Cotton Kurti")
                            .sku("PRD-KURTI-01")
                            .description("Traditional hand-embroidered tribal motif kurti")
                            .course(sewingCourse)
                            .sellingPrice(650.0)
                            .incentiveRatePerUnit(75.0)
                            .active(true)
                            .build()
            );

            com.kiss.kv_tms.entity.Product stole = productRepository.save(
                    com.kiss.kv_tms.entity.Product.builder()
                            .name("Sambalpuri Handloom Stole")
                            .sku("PRD-SAM-02")
                            .description("Pure silk tribal ikat weave shawl")
                            .course(artCourse)
                            .sellingPrice(1200.0)
                            .incentiveRatePerUnit(180.0)
                            .active(true)
                            .build()
            );

            bomRepository.save(
                    com.kiss.kv_tms.entity.BillOfMaterials.builder()
                            .product(kurti)
                            .rawMaterial(cotton)
                            .quantityPerUnit(2.5)
                            .build()
            );

            bomRepository.save(
                    com.kiss.kv_tms.entity.BillOfMaterials.builder()
                            .product(kurti)
                            .rawMaterial(buttons)
                            .quantityPerUnit(4.0)
                            .build()
            );

            bomRepository.save(
                    com.kiss.kv_tms.entity.BillOfMaterials.builder()
                            .product(stole)
                            .rawMaterial(silk)
                            .quantityPerUnit(0.8)
                            .build()
            );

            bomRepository.save(
                    com.kiss.kv_tms.entity.BillOfMaterials.builder()
                            .product(stole)
                            .rawMaterial(herbalDye)
                            .quantityPerUnit(0.5)
                            .build()
            );

            User prodManager = userRepository.findByCollegeId("KISS-PRD-001").orElse(null);

            productionRunRepository.save(
                    com.kiss.kv_tms.entity.ProductionRun.builder()
                            .batchNumber("BATCH-2026-SEW-001")
                            .product(kurti)
                            .targetQuantity(15)
                            .completedQuantity(15)
                            .status(com.kiss.kv_tms.entity.ProductionStatus.PENDING_APPROVAL)
                            .startDate(java.time.LocalDate.now().minusDays(5))
                            .completionDate(java.time.LocalDate.now().minusDays(1))
                            .supervisor(prodManager)
                            .remarks("Quality finishing verified in Sewing Lab #1. Awaiting Admin clearance for POS sale.")
                            .build()
            );

            productionRunRepository.save(
                    com.kiss.kv_tms.entity.ProductionRun.builder()
                            .batchNumber("BATCH-2026-SAM-001")
                            .product(stole)
                            .targetQuantity(10)
                            .completedQuantity(10)
                            .status(com.kiss.kv_tms.entity.ProductionStatus.APPROVED_FOR_SALE)
                            .startDate(java.time.LocalDate.now().minusDays(10))
                            .completionDate(java.time.LocalDate.now().minusDays(4))
                            .supervisor(prodManager)
                            .remarks("Certified Grade-A handicraft. Dispatched to Sales POS rack.")
                            .build()
            );

            productionRunRepository.save(
                    com.kiss.kv_tms.entity.ProductionRun.builder()
                            .batchNumber("BATCH-2026-SEW-002")
                            .product(kurti)
                            .targetQuantity(25)
                            .completedQuantity(0)
                            .status(com.kiss.kv_tms.entity.ProductionStatus.IN_PROGRESS)
                            .startDate(java.time.LocalDate.now())
                            .supervisor(prodManager)
                            .remarks("Active manufacturing batch running in Workshop 2.")
                            .build()
            );

            System.out.println(">>> [KV-TMS] Seeded Production Materials, Products, BOM Recipes, and Initial Batches.");
        }

        if (productRepository.findBySku("PRD-BAM-03").isEmpty()) {
            com.kiss.kv_tms.entity.RawMaterial bamboo = rawMaterialRepository.findByName("Seasoned Bamboo Stalks").orElseGet(() ->
                    rawMaterialRepository.save(com.kiss.kv_tms.entity.RawMaterial.builder()
                            .name("Seasoned Bamboo Stalks")
                            .unitOfMeasure("Stalks")
                            .currentStock(120.0)
                            .reorderLevel(25.0)
                            .unitCost(90.0)
                            .build())
            );

            com.kiss.kv_tms.entity.RawMaterial lacquer = rawMaterialRepository.findByName("Natural Lacquer & Varnish").orElseGet(() ->
                    rawMaterialRepository.save(com.kiss.kv_tms.entity.RawMaterial.builder()
                            .name("Natural Lacquer & Varnish")
                            .unitOfMeasure("Litres")
                            .currentStock(25.0)
                            .reorderLevel(5.0)
                            .unitCost(240.0)
                            .build())
            );

            com.kiss.kv_tms.entity.Course artCourse = courseRepository.findByCode("VOC-ART-102").orElse(null);

            com.kiss.kv_tms.entity.Product lamp = productRepository.save(
                    com.kiss.kv_tms.entity.Product.builder()
                            .name("Tribal Bamboo Table Lamp")
                            .sku("PRD-BAM-03")
                            .description("Hand-carved polished bamboo ambient lamp")
                            .course(artCourse)
                            .sellingPrice(850.0)
                            .incentiveRatePerUnit(120.0)
                            .active(true)
                            .build()
            );

            bomRepository.save(
                    com.kiss.kv_tms.entity.BillOfMaterials.builder()
                            .product(lamp)
                            .rawMaterial(bamboo)
                            .quantityPerUnit(3.0)
                            .build()
            );

            bomRepository.save(
                    com.kiss.kv_tms.entity.BillOfMaterials.builder()
                            .product(lamp)
                            .rawMaterial(lacquer)
                            .quantityPerUnit(0.25)
                            .build()
            );

            System.out.println(">>> [KV-TMS] Seeded Bamboo Studio materials and Tribal Lamp product.");
        }
    }

    private void seedWorkshops() {
        if (workshopRepository.count() == 0) {
            com.kiss.kv_tms.entity.Course sewingCourse = courseRepository.findByCode("VOC-SEW-101").orElse(null);
            com.kiss.kv_tms.entity.Course artCourse = courseRepository.findByCode("VOC-ART-102").orElse(null);

            workshopRepository.save(com.kiss.kv_tms.entity.Workshop.builder()
                    .name("Workshop Lab #1 (Sewing & Textiles)")
                    .shortName("Sewing & Tailoring Lab #1")
                    .category("Textiles & Garments")
                    .course(sewingCourse)
                    .productName("Handcrafted Cotton Kurti")
                    .sku("PRD-KURTI-01")
                    .batchPrefix("BATCH-2026-SEW")
                    .sellingPrice(650.0)
                    .incentiveRate(75.0)
                    .status(com.kiss.kv_tms.entity.ProductionStatus.APPROVED_FOR_SALE)
                    .proposedBy("admin@kiss.ac.in")
                    .approvalRemarks("Charter Vocational Lab #1 approved for campus apparel production.")
                    .bomSummary("Pure Cotton Fabric (2.5m) + Wooden Buttons (4 pcs)")
                    .build());

            workshopRepository.save(com.kiss.kv_tms.entity.Workshop.builder()
                    .name("Workshop Lab #2 (Sambalpuri Handloom)")
                    .shortName("Tribal Handloom Workshop #2")
                    .category("Heritage Weaving")
                    .course(artCourse)
                    .productName("Sambalpuri Handloom Stole")
                    .sku("PRD-SAM-02")
                    .batchPrefix("BATCH-2026-SAM")
                    .sellingPrice(1200.0)
                    .incentiveRate(180.0)
                    .status(com.kiss.kv_tms.entity.ProductionStatus.APPROVED_FOR_SALE)
                    .proposedBy("admin@kiss.ac.in")
                    .approvalRemarks("Traditional handloom ikat weaving pit-loom facility approved.")
                    .bomSummary("Handloom Silk Yarn (0.8 kg) + Organic Herbal Dyes (0.5 L)")
                    .build());

            workshopRepository.save(com.kiss.kv_tms.entity.Workshop.builder()
                    .name("Workshop Lab #3 (Bamboo & Handicraft Studio)")
                    .shortName("Bamboo & Woodcraft Studio #3")
                    .category("Eco-Artisan Crafts")
                    .course(artCourse)
                    .productName("Tribal Bamboo Table Lamp")
                    .sku("PRD-BAM-03")
                    .batchPrefix("BATCH-2026-BAM")
                    .sellingPrice(850.0)
                    .incentiveRate(120.0)
                    .status(com.kiss.kv_tms.entity.ProductionStatus.APPROVED_FOR_SALE)
                    .proposedBy("admin@kiss.ac.in")
                    .approvalRemarks("Eco-friendly tribal bamboo & lacquer craft studio approved.")
                    .bomSummary("Seasoned Bamboo Stalks (3.0 stalks) + Natural Lacquer (0.25 L)")
                    .build());

            System.out.println(">>> [KV-TMS] Seeded Initial Approved Vocational Workshops.");
        }
    }

    @Transactional
    public void seedFinishedGoodsInventory() {
        List<com.kiss.kv_tms.entity.Product> allProducts = productRepository.findAll();
        for (com.kiss.kv_tms.entity.Product prod : allProducts) {
            // Find total units produced and approved for sale across all runs
            int totalApprovedQty = productionRunRepository.findAll().stream()
                    .filter(r -> r.getProduct() != null && r.getProduct().getId().equals(prod.getId()))
                    .filter(r -> r.getStatus() == com.kiss.kv_tms.entity.ProductionStatus.APPROVED_FOR_SALE)
                    .mapToInt(com.kiss.kv_tms.entity.ProductionRun::getCompletedQuantity)
                    .sum();

            // Total units sold across all order items
            int totalSoldQty = orderItemRepository.findByProductId(prod.getId()).stream()
                    .mapToInt(com.kiss.kv_tms.entity.OrderItem::getQuantity)
                    .sum();

            int netStock = Math.max(0, totalApprovedQty - totalSoldQty);

            com.kiss.kv_tms.entity.FinishedGoodsStock stock = finishedGoodsStockRepository.findByProductId(prod.getId())
                    .orElseGet(() -> com.kiss.kv_tms.entity.FinishedGoodsStock.builder()
                            .product(prod)
                            .availableStock(netStock)
                            .reorderLevel(5)
                            .build());

            stock.setAvailableStock(netStock);
            if (stock.getReorderLevel() == null) {
                stock.setReorderLevel(5);
            }
            finishedGoodsStockRepository.save(stock);
        }
        System.out.println(">>> [KV-TMS] Synchronized Finished Goods inventory with net available stock (Approved - Sold).");
    }

    private void seedNotices() {
        if (noticeRepository.count() == 0) {
            List<com.kiss.kv_tms.entity.Notice> sampleNotices = List.of(
                    com.kiss.kv_tms.entity.Notice.builder()
                            .title("Annual Vocational Craft Exhibition & Evaluation Gala 2026")
                            .content("All scholars, master trainers, and production artisan supervisors are hereby notified that the Annual KISS Vocational Craft Exhibition and practical skill grading will commence next Monday. Trainees must present their practical portfolios.")
                            .targetAudience("ALL")
                            .priority("URGENT")
                            .category("ACADEMIC")
                            .postedBy("Dr. P. K. Routray (Admin)")
                            .pinned(true)
                            .createdAt(java.time.LocalDateTime.now().minusDays(1))
                            .active(true)
                            .build(),
                    com.kiss.kv_tms.entity.Notice.builder()
                            .title("Mandatory Workshop Tool Maintenance & Safety Audit")
                            .content("Vocational trainers and instructors are requested to submit weekly machinery maintenance logs and ensure all trainees wear mandatory protective aprons during Dokra casting and Carpentry joinery sessions.")
                            .targetAudience("TRAINERS")
                            .priority("IMPORTANT")
                            .category("WORKSHOP")
                            .postedBy("Central Administration")
                            .pinned(false)
                            .createdAt(java.time.LocalDateTime.now().minusDays(2))
                            .active(true)
                            .build(),
                    com.kiss.kv_tms.entity.Notice.builder()
                            .title("Stipend Disbursement & 75% Attendance Compliance")
                            .content("Enrolled scholars are reminded that Earn-While-Learn incentive disbursements require a minimum 75% verified monthly attendance record. Leave applications must be submitted beforehand.")
                            .targetAudience("TRAINEES")
                            .priority("NORMAL")
                            .category("GENERAL")
                            .postedBy("Student Affairs & Registrar")
                            .pinned(false)
                            .createdAt(java.time.LocalDateTime.now().minusDays(3))
                            .active(true)
                            .build(),
                    com.kiss.kv_tms.entity.Notice.builder()
                            .title("Production Unit Raw Material Store Audit Notice")
                            .content("Production managers and warehouse supervisors are instructed to reconcile physical stock with system inventory records before month-end dispatch cycles. Immediate report required for brass ingots & timber.")
                            .targetAudience("PRODUCTION")
                            .priority("IMPORTANT")
                            .category("PRODUCTION_ADVISORY")
                            .postedBy("Central Administration")
                            .pinned(false)
                            .createdAt(java.time.LocalDateTime.now().minusDays(4))
                            .active(true)
                            .build()
            );

            noticeRepository.saveAll(sampleNotices);
            System.out.println(">>> [KV-TMS] Seeded default university notices & circulars successfully.");
        }
    }
}